import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({ component: Component, isAuthorized, ...rest }) => {
  
  return (
    <Route {...rest} render={() => isAuthorized
      ? <Component isAuthorized={isAuthorized} {...rest} />
      : <Redirect to={{ pathname:'/join' }} />
    }
    />
  )
};

export const PublicRoute = ({ component: Component, restricted, isAuthorized, ...rest }) => {
    return (
        <Route {...rest} render={() => (
            isAuthorized && restricted ? <Redirect to='/menu' /> : <Component {...rest} />
        )} />
    );
};