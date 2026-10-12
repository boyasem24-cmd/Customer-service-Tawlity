import { FileText, Import, Settings, User, Users } from "lucide-react";
import { CanAccess, useTranslate, useUserMenu } from "ra-core";
import { Link, matchPath, useLocation } from "react-router";
import { RefreshButton } from "@/components/admin/refresh-button";
import { ThemeModeToggle } from "@/components/admin/theme-mode-toggle";
import { LocalesMenuButton } from "@/components/admin/locales-menu-button";
import { UserMenu } from "@/components/admin/user-menu";
import { DropdownMenuItem } from "@/components/ui/dropdown-menu";

import { useConfigurationContext } from "../root/ConfigurationContext";
import { ImportPage } from "../misc/ImportPage";
import { ChangelogPage } from "../misc/ChangelogPage";
import { GlobalSearchButton } from "../search/GlobalSearchButton";

const Header = () => {
  const { darkModeLogo, lightModeLogo, title } = useConfigurationContext();
  const location = useLocation();
  const translate = useTranslate();

  let currentPath: string | boolean = "/";
  if (matchPath("/", location.pathname)) {
    currentPath = "/";
  } else if (matchPath("/contacts/*", location.pathname)) {
    currentPath = "/contacts";
  } else if (matchPath("/companies/*", location.pathname)) {
    currentPath = "/companies";
  } else if (matchPath("/deals/*", location.pathname)) {
    currentPath = "/deals";
  } else if (matchPath("/diners/*", location.pathname)) {
    currentPath = "/diners";
  } else {
    currentPath = false;
  }

  return (
    <>
      <nav className="grow">
        <header className="bg-secondary">
          <div className="px-4">
            <div className="flex justify-between items-center flex-1">
              <Link
                to="/"
                className="flex items-center gap-2 text-secondary-foreground no-underline"
              >
                <img
                  className="[.light_&]:hidden h-6"
                  src={darkModeLogo}
                  alt={title}
                />
                <img
                  className="[.dark_&]:hidden h-6"
                  src={lightModeLogo}
                  alt={title}
                />
                <h1 className="text-xl font-semibold text-primary font-wordmark">
                  {title}
                </h1>
              </Link>
              <div>
                <nav className="flex items-end">
                  <NavigationTab
                    label={translate("ra.page.dashboard")}
                    to="/"
                    isActive={currentPath === "/"}
                  />
                  <NavSection
                    label={translate("crm.navigation.restaurants_section")}
                  >
                    <NavigationTab
                      label={translate("resources.companies.name", {
                        smart_count: 2,
                      })}
                      to="/companies"
                      isActive={currentPath === "/companies"}
                    />
                    <NavigationTab
                      label={translate("resources.contacts.name", {
                        smart_count: 2,
                      })}
                      to="/contacts"
                      isActive={currentPath === "/contacts"}
                    />
                    <NavigationTab
                      label={translate("crm.navigation.pipeline")}
                      to="/deals"
                      isActive={currentPath === "/deals"}
                    />
                  </NavSection>
                  <CanAccess resource="diners" action="list">
                    <NavSection
                      label={translate("crm.navigation.diners_section")}
                    >
                      <NavigationTab
                        label={translate("resources.diners.name", {
                          smart_count: 2,
                        })}
                        to="/diners"
                        isActive={currentPath === "/diners"}
                      />
                    </NavSection>
                  </CanAccess>
                </nav>
              </div>
              <div className="flex items-center">
                <GlobalSearchButton />
                <LocalesMenuButton />
                <ThemeModeToggle />
                <RefreshButton />
                <UserMenu>
                  <ProfileMenu />
                  <CanAccess resource="sales" action="list">
                    <UsersMenu />
                  </CanAccess>
                  <CanAccess resource="configuration" action="edit">
                    <SettingsMenu />
                  </CanAccess>
                  <ImportFromJsonMenuItem />
                  <ChangelogMenuItem />
                </UserMenu>
              </div>
            </div>
          </div>
        </header>
      </nav>
    </>
  );
};

/** A labelled group of tabs, keeping the Restaurants and Diners sides apart. */
const NavSection = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <div className="flex flex-col items-stretch border-s border-secondary-foreground/15 ms-2 ps-2">
    <span className="px-6 pt-1 text-[10px] font-semibold uppercase tracking-wider text-secondary-foreground/50 leading-none">
      {label}
    </span>
    <div className="flex">{children}</div>
  </div>
);

const NavigationTab = ({
  label,
  to,
  isActive,
}: {
  label: string;
  to: string;
  isActive: boolean;
}) => (
  <Link
    to={to}
    className={`px-5 pt-1.5 pb-2.5 text-sm font-medium transition-colors border-b-2 ${
      isActive
        ? "text-secondary-foreground border-highlight"
        : "text-secondary-foreground/70 border-transparent hover:text-secondary-foreground/80"
    }`}
  >
    {label}
  </Link>
);

const UsersMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<UsersMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/sales" className="flex items-center gap-2">
        <Users />
        {translate("resources.sales.name", { smart_count: 2 })}
      </Link>
    </DropdownMenuItem>
  );
};

const ProfileMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ProfileMenu> must be used inside <UserMenu?");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/profile" className="flex items-center gap-2">
        <User />
        {translate("crm.profile.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const SettingsMenu = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<SettingsMenu> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to="/settings" className="flex items-center gap-2">
        <Settings />
        {translate("crm.settings.title")}
      </Link>
    </DropdownMenuItem>
  );
};

const ImportFromJsonMenuItem = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ImportFromJsonMenuItem> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to={ImportPage.path} className="flex items-center gap-2">
        <Import />
        {translate("crm.header.import_data")}
      </Link>
    </DropdownMenuItem>
  );
};

const ChangelogMenuItem = () => {
  const translate = useTranslate();
  const userMenuContext = useUserMenu();
  if (!userMenuContext) {
    throw new Error("<ChangelogMenuItem> must be used inside <UserMenu>");
  }
  return (
    <DropdownMenuItem asChild onClick={userMenuContext.onClose}>
      <Link to={ChangelogPage.path} className="flex items-center gap-2">
        <FileText />
        {translate("crm.changelog.title")}
      </Link>
    </DropdownMenuItem>
  );
};
export default Header;
