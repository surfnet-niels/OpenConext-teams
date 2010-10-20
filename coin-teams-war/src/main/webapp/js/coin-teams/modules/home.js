COIN.MODULES.Home = function(sandbox) {
	// Public interface
	var module = {
		init: function() {
			
			// Focus on the search box
			$('span.team-search > input[type=text]').live('focus', function() {
				if ($(this).val() == '<spring:message code="jsp.home.DefaultSearchTerm" />') {
					$(this).val('');
				};
			});
			
			// Blur on the search box
			$('span.team-search > input[type=text]').live('blur', function() {
				if ($(this).val() == '') {
					$(this).val('<spring:message code="jsp.home.DefaultSearchTerm" />');
				};
			});
			
//			// Click on the [ Submit ]
//			$('#SubmitTeamSearch').live('click', function() {
//				
//			});
		},
		
		destroy: function() {
			
		}
	};
	
	// Private library (through closure)
	var library = {
			
	};

	// Return the public interface
	return module;
};