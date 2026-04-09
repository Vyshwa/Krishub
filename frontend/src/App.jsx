import { createRouter, createRoute, createRootRoute, RouterProvider, Outlet } from '@tanstack/react-router';
import { lazy, Suspense, useEffect } from 'react';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { SoftwareSolutions } from './pages/SoftwareSolutions';
import { HardwareServices } from './pages/HardwareServices';
import { Contact } from './pages/Contact';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Pricing } from './pages/Pricing';
import { Privacy } from './pages/Privacy';
import { Terms } from './pages/Terms';
import { Refund } from './pages/Refund';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ParticleBackground } from './components/ParticleBackground';
import { PageTransition } from './components/PageTransition';

/* Only lazy-load heavy / rare pages */
const heavyChunks = {
  Apps: () => import('./pages/Apps'),
  SsoRedirect: () => import('./pages/SsoRedirect'),
  Pair: () => import('./pages/Pair'),
  MobileAlerts: () => import('./pages/MobileAlerts'),
};

const Apps = lazy(() => heavyChunks.Apps().then(m => ({ default: m.Apps })));
const SsoRedirect = lazy(() => heavyChunks.SsoRedirect().then(m => ({ default: m.SsoRedirect })));
const Pair = lazy(() => heavyChunks.Pair().then(m => ({ default: m.Pair })));
const MobileAlerts = lazy(() => heavyChunks.MobileAlerts().then(m => ({ default: m.MobileAlerts })));

import { useRouterState } from '@tanstack/react-router';

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}

function Lazy({ Component }) {
  return (
    <Suspense fallback={<PageLoader />}>
      <Component />
    </Suspense>
  );
}

function Layout() {
  const routerState = useRouterState();
  const isAppRoute = routerState.location.pathname === '/apps';
  const isAlertsRoute = routerState.location.pathname === '/alerts';

  /* Prefetch heavy chunks after initial paint */
  useEffect(() => {
    requestIdleCallback(() => {
      Object.values(heavyChunks).forEach(fn => fn().catch(() => {}));
    });
  }, []);

  return (
    <div className="flex min-h-screen flex-col relative">
      <ParticleBackground />
      <Header />
      <main className="flex-1 min-h-screen relative z-10">
        <PageTransition>
          <Outlet />
        </PageTransition>
      </main>
      {!isAppRoute && !isAlertsRoute && <Footer />}
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
  component: () => <Lazy Component={Apps} />,
});
const ssoRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/sso',
  validateSearch: (search) => ({
    redirect: search?.redirect || undefined,
  }),
  component: () => <Lazy Component={SsoRedirect} />,
});
const pricingRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pricing',
  component: Pricing,
});
const privacyRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/privacy',
  component: Privacy,
});
const termsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/terms',
  component: Terms,
});
const refundRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/refund',
  component: Refund,
});
const pairRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/pair',
  validateSearch: (search) => ({
    token: search?.token || undefined,
  }),
  component: () => <Lazy Component={Pair} />,
});
const alertsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/alerts',
  component: () => <Lazy Component={MobileAlerts} />,
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
  pricingRoute,
  privacyRoute,
  termsRoute,
  refundRoute,
  pairRoute,
  alertsRoute,
]);

const router = createRouter({ routeTree });

function App() {
  return <RouterProvider router={router} />;
}

export default App;
