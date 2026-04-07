import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { SoftwareSolutions } from './pages/SoftwareSolutions';
import { HardwareServices } from './pages/HardwareServices';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Apps } from './pages/Apps';
import { SsoRedirect } from './pages/SsoRedirect';
import { Header } from './components/Header';
import { Footer } from './components/Footer';

import { useRouterState } from '@tanstack/react-router';

function Layout() {
  const routerState = useRouterState();
  const isAppRoute = routerState.location.pathname === '/apps';

  return (
    <div className="flex min-h-screen flex-col">
      <Header />
      <main className="flex-1">
        <Outlet />
      </main>
      {!isAppRoute && <Footer />}
    </div>
  );
}


const rootRoute = createRootRoute({
  component: Layout,
});

const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  validateSearch: (search) => {
    return {
      view: search?.view || undefined,
    };
  },
  component: Home,
});

const aboutRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/about',
  component: About,
});

const softwareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/software',
  component: SoftwareSolutions,
});

const hardwareRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/hardware',
  component: HardwareServices,
});

const contactRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/contact',
  component: Contact,
});
const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  validateSearch: (search) => ({
    redirect: search?.redirect || undefined,
  }),
  component: Login,
});
const registerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/register',
  component: Register,
});
const appsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/apps',
  component: Apps,
});
const ssoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sso',
  validateSearch: (search) => ({
    redirect: search?.redirect || undefined,
  }),
  component: SsoRedirect,
});

const routeTree = rootRoute.addChildren([
  indexRoute,
  aboutRoute,
  softwareRoute,
  hardwareRoute,
  contactRoute,
  loginRoute,
  registerRoute,
  appsRoute,
  ssoRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
