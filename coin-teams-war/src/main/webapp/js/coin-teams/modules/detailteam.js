/*
 * Copyright 2011 SURFnet bv, The Netherlands
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

COIN.MODULES.Detailteam = function(sandbox) {
	// Public interface
	var module = {
		init: function() {
			
			// Add odd / even classes to table rows
			sandbox.fixTableLayout($('table.team-table'));
			
			// Leave team admin message box
			if ( $("#__notifyBar").length > 0 ) {
				$.notifyBar({ close: true, cls: "error", html: "<p>" + $('#__notifyBar').html() + "</p>", delay: 100000 });
			}
			
			// Leave Team Confirm (appears when a user clicks 
			// the "Leave" button of a team in the detailteam screen)
			$('#LeaveTeamDialog').dialog({
				autoOpen   : false,
				width      : 250,
				resizable  : false,
				modal      : true,
				dialogClass: "ui-popup",
				buttons: {
					'<spring:message code='jsp.dialog.leaveteam.Submit' />': library.leaveTeam,
					'<spring:message code='jsp.general.Cancel' />': library.cancelLeave
				},
				open: function() {
//					$buttonPane = $(this).next();
//		            $buttonPane.find('button:first').addClass('ui-priority-primary');
//		            $buttonPane.find('button:last').addClass('ui-priority-secondary');   
				},
				closeOnEscape: true
			});
			
			// Delete Team Confirm (appears when a user clicks 
			// the "Delete" button of a team in the detailteam screen)
			$('#DeleteTeamDialog').dialog({
				autoOpen   : false,
				width      : 250,
				resizable  : false,
				modal      : true,
				dialogClass: "ui-popup",
				buttons: {
					'<spring:message code='jsp.dialog.deleteteam.Submit' />': library.deleteTeam,
					'<spring:message code='jsp.general.Cancel' />': library.cancelDelete
				},
				open: function() {
//					$buttonPane = $(this).next();
//		            $buttonPane.find('button:first').addClass('ui-priority-primary');
//		            $buttonPane.find('button:last').addClass('ui-priority-secondary');   
				},
				closeOnEscape: true
			});
			
			// Clicked [ Leave ]
			$('a#LeaveTeam').live('click', function(e) {
				e.preventDefault();
				$('#LeaveTeamDialog').removeClass('hide').dialog('open');
			});
			
			// Clicked [ Delete ]
			$('a#DeleteTeam').live('click', function(e) {
				e.preventDefault();
				$('#DeleteTeamDialog').removeClass('hide').dialog('open');
			});	
			
			// Clicked [ Permission ]
			$('input[type=checkbox][name$=Role]').live('click', function() {
				if($(this).attr('checked')) {
					library.addRole($(this));
				} else {
					library.removeRole($(this));
				}
			});

      $('a.open_invitationinfo').live('click', function(e) {
        e.preventDefault();
        var invitationInfo = $(this).attr('id');
        $('.'+invitationInfo).toggleClass('hide');
      });
		},
		
		destroy: function() {
			
		}
	};
	
	// Private library (through closure)
	var library = {
		getMemberId: function(el) {
			if (el instanceof jQuery) {
				var idSplit = el.attr('id').split('_', '2');
				return idSplit[1];
			}
		},
		getRole: function(el) {
			if (el instanceof jQuery) {
				var idSplit = el.attr('id').split('_', '2');
				return idSplit[0];
			}
		},
		leaveTeam: function() {
			sandbox.redirectBrowserTo($('a#LeaveTeam').attr('href'));
		},
		cancelLeave: function() {
			$('#LeaveTeamDialog').addClass('hide').dialog('close');
		},
		deleteTeam: function() {
			sandbox.redirectBrowserTo($('a#DeleteTeam').attr('href'));
		},
		cancelDelete: function() {
			$('#DeleteTeamDialog').addClass('hide').dialog('close');
		},
		addRole: function(el) {
			$('#memberId').val(library.getMemberId(el));
			$('#roleId').val(library.getRole(el));
			$('#detailForm').submit();
		},
		removeRole: function(el) {
			var teamId = $('input[name=teamId]').val();
			var memberId = library.getMemberId(el);
			var role = library.getRole(el);
			
			var data = {
					'team' : teamId,
					'member' : memberId,
					'role' : role
			};
			
			sandbox.post('doremoverole.shtml', data, function(data) {
				if (data["status"] === 'success') {
					if ($('input[type=hidden][name=loggedInUser]').val() === memberId) {
		        var view = $('input[name=view]').val();
						sandbox.redirectBrowserTo('detailteam.shtml?team=' + teamId + '&view=' + view);
					}
					// is the admin role removed?
					if (role === '0') {
						// Enable the manager role if the admin role has been assigned
						el.parent().parent().find('input[name=managerRole]').attr('disabled', false);
						
						var admins = [];
						// Count the checked admin roles that are left
						$('input[name=adminRole]:checked').each(function(){admins.push($(this))});
            // display/hide only admin warning
            if(data["onlyadmin"] && $('#onlyAdmin').hasClass('hide')) {
              $('#onlyAdmin').removeClass('hide');
            } else if (!data["onlyadmin"] && !$('#onlyAdmin').hasClass('hide')) {
              $('#onlyAdmin').addClass('hide');
            }

						// Only one left?
						if (data["onlyadmin"] && admins.length == 1) {
							// Disable the admin role that is checked, because otherwise no admins will be left
							admins[0].attr('disabled', true);
              var deleteTeam = $('#DeleteTeam');
              if(sandbox.typeOf($('#DeleteTeam'))!='undefined') {
                $('#DeleteTeam').parent().attr('class', 'last');
                $('#LeaveTeam').parent().addClass('hide');
              }
						}
					}
					$.notifyBar({ cls: "success", html: "<p><spring:message code='jsp.detailteam.RemoveRoleSuccess' /></p>", delay: 1000 });
				} else if (data === 'onlyOneAdmin') {
					$.notifyBar({ close: "true", cls: "error", html: "<p><spring:message code='jsp.detailteam.RemoveRoleFailureOneAdmin' /></p>", delay: 10000 });
					el.attr('checked') ? el.attr('checked', false) : el.attr('checked', true);
				} else {
					el.attr('checked') ? el.attr('checked', false) : el.attr('checked', true);
					$.notifyBar({ close: "true", cls: "error", html: "<p><spring:message code='jsp.detailteam.RemoveRoleFailure' /></p>", delay: 10000 });
				}
			});
		}
	};

	// Return the public interface
	return module;
};