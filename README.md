## smtp-connection-as-promised

This module provides promisified version of `smtp-connection-mit` class. The API
is the same except that all methods returns `Promise` object.

### Requirements

This module requires Node >= 6.

### Installation

```shell
npm install smtp-connection-as-promised
```

### Usage

`smtp-connection-as-promised` can be used like standard `smtp-connection-mit`
module:

```js
const SMTPConnectionAsPromised = require('smtp-connection-as-promised')
```

#### constructor

```
const client = new SMTPConnectionAsPromised(options)
```

Create new SMTPConnection instance. Options are the same as for original
`smtp-server-mit` constructor.

_Example:_

```js
const client = new SMTPConnectionAsPromised({
  opportunisticTLS: true,
  host: 'smtp.example.com',
  port: 25
})
```

#### connect

```js
await connection.connect()
console.log(connection.secure)
```

Establish the connection and set the `secure` property.

#### login

```js
await connection.login(auth)
```

Login to the server if requires authentication.

`auth` is the authentication object with `user`, `pass` and `xoauth2`
properties.

_Example:_

```js
await connection.login({
  user: 'from@example.com',
  pass: 'secret'
})
```

#### send

```js
const info = await connection.send(envelope, message)
```

Send a message with an envelope. The `info` object is returned in a Promise.

_Example:_

```js
const envelope = {
  from: 'from@example.com',
  to: 'to@example.net'
}

const message = '' +
  'From: from@example.com\n' +
  'To: to@example.net\n' +
  'Subject: test\n' +
  '\n' +
  'Test\n'

const info = await connection.send(envelope, message)
console.log(info.response)
```

#### quit

```js
const hadError = await connection.quit()
```

Graceful SMTP session ending. The `QUIT` command is sent. `hadError` is `true`
if the socket was closed due to a transmission error and `null` when was
already closed.

#### close

```js
const hadError = await connection.close()
```

Disconnecting of SMTP session.

#### reset

```js
await connection.reset()
```

Reseting the SMTP session. The `RSET` command is set.

### Promise

This module uses `any-promise` and any ES6 Promise library or polyfill is
supported.

Ie. `bluebird` can be used as Promise library for this module, if it is
registered before.

```js
require('any-promise/register/bluebird')
const smtpConnectionAsPromised = require('smtp-connection-as-promised')
```

### License

Copyright (c) 2016-2017 Piotr Roszatycki <piotr.roszatycki@gmail.com>

[MIT](https://opensource.org/licenses/MIT)
