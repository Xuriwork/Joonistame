import { Route, Redirect } from 'react-router-dom';

export const PrivateRoute = ({component: Component, isAuthorized, ...rest }) => {
  return (
    <Route {...rest} render={props => isAuthorized
      ? <Component isAuthorized={isAuthorized} {...props} />
      : <Redirect to={{ pathname:'/join' }} />
    }
    />
  )
};

export const PublicRoute = ({component: Component, restricted, isAuthorized, ...rest}) => {
    return (
        <Route {...rest} render={props => (
            isAuthorized && restricted ? <Redirect to='/menu' /> : <Component {...props} />
        )} />
    );
};