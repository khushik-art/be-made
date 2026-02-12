import { observer } from 'mobx-react-lite';
import { BrowserRouter, Route, Routes } from 'react-router-dom';

import { LoginPage } from '../components/Auth/LoginPage';
import { CheckoutPage } from '../components/Checkout/CheckoutPage';
import { Viewer } from '../components/Viewer/Viewer';
import { NavigationRoutes } from '../constant';

export const Router = observer(() => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path={NavigationRoutes.Checkout} element={<CheckoutPage />} />
        <Route path={NavigationRoutes.Login} element={<LoginPage />} />
        <Route path={NavigationRoutes.Default} element={<Viewer />} />
      </Routes>
    </BrowserRouter>
  );
});
