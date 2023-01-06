import * as React from 'react';
import { Container, Nav, Navbar } from 'react-bootstrap';
// import oncokbImg from 'content/images/oncokb.svg';
import oncokbImg from 'oncokb-styles/dist/images/logo/oncokb-white.svg';
import { observer } from 'mobx-react';
import WindowStore from 'app/store/WindowStore';
import { RouterStore } from 'mobx-react-router';
import { withRouter } from 'react-router';
import { NavLink } from 'react-router-dom';
import AccountMenu from 'app/pages/menus/account';
import { action, observable } from 'mobx';
import {
  MSK_LOGO_ICON_CUTOFF,
  ONCOKB_TM,
  PAGE_ROUTE,
  PAGE_TITLE,
} from 'app/config/constants';
import UserMessage from 'app/components/userMessager/UserMessage';
import OncoKBSearch from 'app/components/oncokbSearch/OncoKBSearch';
import classnames from 'classnames';
import autobind from 'autobind-decorator';
import AuthenticationStore from 'app/store/AuthenticationStore';
import AccountMessage from 'app/components/accountMessage/AccountMessage';
import MskccLogo from 'app/components/MskccLogo';
import AppStore from 'app/store/AppStore';
import OptimizedImage from 'app/shared/image/OptimizedImage';

export interface IHeaderProps {
  isUserAuthenticated: boolean;
  isAdmin: boolean;
  ribbonEnv: string;
  isInProduction: boolean;
  isSwaggerEnabled: boolean;
  windowStore: WindowStore;
  authStore: AuthenticationStore;
  routing: RouterStore;
  appStore: AppStore;
}

type SubpageLink = {
  title: string;
  link: string;
};

// @ts-ignore
@withRouter
@observer
class Header extends React.Component<IHeaderProps> {
  private subPages: SubpageLink[] = [
    { title: 'Levels of Evidence', link: PAGE_ROUTE.LEVELS },
    { title: 'Actionable Genes', link: PAGE_ROUTE.ACTIONABLE_GENE },
    { title: 'Cancer Genes', link: PAGE_ROUTE.CANCER_GENES },
    { title: 'API / License', link: PAGE_ROUTE.API_ACCESS },
    { title: 'About', link: PAGE_ROUTE.ABOUT },
    { title: 'News', link: PAGE_ROUTE.NEWS },
    { title: 'FAQ', link: PAGE_ROUTE.FAQ_ACCESS },
  ];

  @observable isNavExpanded = false;
  @observable searchBarIsHovered = false;
  private searchBarIsHoveredTimeout: number;

  @action.bound
  toggleNav() {
    this.isNavExpanded = !this.isNavExpanded;
  }

  @action
  closeNav(event: any) {
    if (event.target.text !== PAGE_TITLE.ACCOUNT) {
      this.isNavExpanded = false;
    }
  }

  getLink(page: SubpageLink) {
    return (
      <NavLink to={page.link} key={page.title} className={'mr-auto nav-item'}>
        {page.title}
      </NavLink>
    );
  }

  @autobind
  @action
  updateSearchBarHover(status: boolean, timeout: number) {
    if (this.searchBarIsHoveredTimeout) {
      window.clearTimeout(this.searchBarIsHoveredTimeout);
    }
    this.searchBarIsHoveredTimeout = window.setTimeout(
      () => (this.searchBarIsHovered = status),
      timeout
    );
  }

  @autobind
  @action
  enterSearchBar() {
    this.updateSearchBarHover(true, 100);
  }

  @autobind
  @action
  leaveSearchBar() {
    this.updateSearchBarHover(false, 500);
  }

  public render() {
    return (
      <>
        <UserMessage
          windowStore={this.props.windowStore}
          show={true}
          appStore={this.props.appStore}
        />
        <AccountMessage
          windowStore={this.props.windowStore}
          authStore={this.props.authStore}
        />
        <header className="sticky-top header">
          <Navbar
            bg="oncokb"
            expand="lg"
            className="navbar-light"
            expanded={this.isNavExpanded}
          >
            <Container fluid={!this.props.windowStore.isLargeScreen}>
              <Navbar.Brand>
                <NavLink to={PAGE_ROUTE.HOME}>
                  <OptimizedImage height={30} src={oncokbImg} alt={ONCOKB_TM} />
                </NavLink>
              </Navbar.Brand>
              <Navbar.Toggle onClick={this.toggleNav} />
              <Navbar.Collapse onClick={(event: any) => this.closeNav(event)}>
                <Nav className="mr-auto">
                  {this.subPages.map(page => this.getLink(page))}
                </Nav>
                <Nav>
                  {!this.isNavExpanded && (
                    <>
                      {this.searchBarIsHovered && (
                        <span
                          className={classnames(
                            'position-relative',
                            'nav-item'
                          )}
                          onMouseEnter={this.enterSearchBar}
                          onMouseLeave={this.leaveSearchBar}
                          onBlur={this.leaveSearchBar}
                        >
                          <span
                            className={'position-absolute'}
                            style={{ width: 500, right: 0, color: 'black' }}
                          >
                            <OncoKBSearch />
                          </span>
                        </span>
                      )}
                      {!this.searchBarIsHovered && (
                        <Nav.Item
                          style={{ paddingRight: 0 }}
                          onMouseEnter={this.enterSearchBar}
                          onMouseLeave={this.leaveSearchBar}
                          onBlur={this.leaveSearchBar}
                        >
                          <i className={'fa fa-search'}></i>
                        </Nav.Item>
                      )}
                    </>
                  )}
                  <AccountMenu
                    isAuthenticated={this.props.isUserAuthenticated}
                    isAdmin={this.props.isAdmin}
                  />
                  <Nav.Item style={{ paddingRight: 0 }}>
                    <MskccLogo
                      color={'white'}
                      imageHeight={35}
                      size={
                        this.props.windowStore.isLargeScreen &&
                        this.props.windowStore.size.width <=
                          MSK_LOGO_ICON_CUTOFF
                          ? 'sm'
                          : 'lg'
                      }
                    />
                  </Nav.Item>
                </Nav>
              </Navbar.Collapse>
            </Container>
          </Navbar>
        </header>
      </>
    );
  }
}

export default Header;
