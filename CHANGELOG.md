# CHANGELOG

## 0.2.2

- The configuration is read from ~/.mockifyrc
- Daemon logs are in ~/.mockify

## 0.2.1

- Child processes (proxies, mocks) are no longer handled by the webapp, the core of the app is now a daemon
- The webapp is served by a http-server, handled by the daemon
- The webapp and the JS lib communicate with the daemon by websockets
- The cli uses the JS lib

## 0.0.1

Initial release.

### Features
 - Proxy existing API(s)
 - Save query and response of API(s)
 - Mock the exact same request with exact same results
 - Display proxy/mock binaries stdout/stderr on the webapp
