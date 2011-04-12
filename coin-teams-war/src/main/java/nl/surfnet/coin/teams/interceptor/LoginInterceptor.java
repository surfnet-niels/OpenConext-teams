package nl.surfnet.coin.teams.interceptor;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import javax.servlet.http.HttpSession;

import org.opensocial.models.Person;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.util.StringUtils;
import org.springframework.web.servlet.handler.HandlerInterceptorAdapter;

import nl.surfnet.coin.teams.service.TeamPersonService;
import nl.surfnet.coin.teams.util.TeamEnvironment;

/**
 * Intercepts calls to controllers to handle Single Sign On details from
 * Shibboleth and sets a Person object on the session when the user is logged
 * in.
 */
public class LoginInterceptor extends HandlerInterceptorAdapter {

  public static final String PERSON_SESSION_KEY = "person";
  private static final ThreadLocal<String> loggedInUser = new ThreadLocal<String>();

  @Autowired
  private TeamEnvironment teamEnvironment;

  @Autowired
  private TeamPersonService personService;

  /*
   * Return the part of the path of the request
   */
  private String getRequestedPart(HttpServletRequest request) {
    String requestUri = request.getRequestURI();
    return requestUri;
  }

  @Override
  public boolean preHandle(HttpServletRequest request,
      HttpServletResponse response, Object handler) throws Exception {

    HttpSession session = request.getSession();

    String remoteUser = getRemoteUser(request);

    // Check session first:
    Person person = (Person) session.getAttribute(PERSON_SESSION_KEY);
    if (person == null || !person.getId().equals(remoteUser)) {

      if (StringUtils.hasText(remoteUser)) {
        person = personService.getPerson(remoteUser);
        // Add person to session:
        session.setAttribute(PERSON_SESSION_KEY, person);

        if (person == null) {
          String errorMessage = "Cannot find user: " + remoteUser;
          throw new ServletException(errorMessage);
        }
        // User is not logged in, and REMOTE_USER header is empty.
        // Check whether the user is requesting the landing page, if not
        // redirect him to the landing page.
      } else {
        String url = getRequestedPart(request);
        String[] urlSplit = url.split("/");

        // Unprotect the javascript files and teams.xml
        if (urlSplit[2].equals("js") || urlSplit[2].equals("teams.xml")) {
          return super.preHandle(request, response, handler);
        } else {
          response.sendRedirect("/Shibboleth.sso/Login?target="
              + teamEnvironment.getTeamsURL() + "/home.shtml?teams=my");
          return false;
        }
      }
    }
    loggedInUser.set(remoteUser);
    return super.preHandle(request, response, handler);
  }

  /**
   * Hook for subclasses to override the shibboleth default behaviour
   * 
   * @param request
   *          the httpRequest
   * @return the String of the logged in user
   */
  protected String getRemoteUser(HttpServletRequest request) {
    return request.getHeader("REMOTE_USER");
  }

  /**
   * @param teamEnvironment
   *          the teamEnvironment to set
   */
  public void setTeamEnvironment(TeamEnvironment teamEnvironment) {
    this.teamEnvironment = teamEnvironment;
  }

  /**
   * @return the teamEnvironment
   */
  protected TeamEnvironment getTeamEnvironment() {
    return teamEnvironment;
  }

  /**
   * @return the loggedinuser
   */
  public static String getLoggedInUser() {
    return loggedInUser.get();
  }

  /**
   * @param userId
   *          the user that has to be logged in
   */
  public static void setLoggedInUser(String userId) {
    loggedInUser.set(userId);
  }

  public void setPersonService(TeamPersonService personService) {
    this.personService = personService;
  }
}
