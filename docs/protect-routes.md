## Protect your routes

### Routes only for authenticated users

For every route, you want to make accessible only for **authenticated** users add following object:

```javascript
meta: { auth: true }
```

*Example:*

```javascript
{
    path: '/admin/dashboard',
    name: 'dashboard',
    component: Dashboard,
    meta: { auth: true } // You need to be logged in to access this route
}
```

### Routes only for unauthenticated users

For every route, you want to make accessible only for  **unauthenticated** users add following object:

```javascript
meta: { auth: false }
```

*Example:*

```javascript
{
    path: '/login',
    name: 'login',
    component: Login,
    meta: { auth: false } // You need to be logged out to access this route
}
```

### Public routes

Public routes can be accessed by both **authenticated and unauthenticated** users. For every route, you want to make public **do not add** `meta { auth: ... }` object at all.

*Example:*

```javascript
{
    path: '/about',
    name: 'about',
    component: About
}
```

## Note

You can change `auth` meta key and `true`, `false` and `null` values for authenticated, unauthenticated and public routes in [options object](configuration.md).

###### Continue reading to [Configuration](configuration.md)
