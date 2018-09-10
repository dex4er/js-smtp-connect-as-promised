import { After, And, Feature, Given, Scenario, Then, When } from './lib/steps'

import { SMTPServerAsPromised, SMTPServerAsPromisedServerAddress, SMTPServerAuthentication, SMTPServerAuthenticationResponse, SMTPServerSession } from 'smtp-server-as-promised'

import { SMTPConnectionAsPromised, SMTPConnectionSentMessageInfo } from '../src/smtp-connection-as-promised'

Feature('Test smtp-connection-as-promised module', () => {
  const crlf = '\x0d\x0a'

  const from = 'sender@example.com'
  const to = 'recipient@example.net'
  const user = 'user'
  const pass = 'pass'

  const rfc2822Message = '' +
    'From: ' + from + crlf +
    'To: ' + to + crlf +
    'Subject: test' + crlf +
    crlf +
    'Test' + crlf +
    '.' + crlf

  async function onAuth (auth: SMTPServerAuthentication, _session: SMTPServerSession): Promise<SMTPServerAuthenticationResponse> {
    if (auth.method === 'PLAIN' && auth.username === user && auth.password === pass) {
      return { user: auth.username }
    } else {
      throw new Error('Invalid username or password')
    }
  }

  Scenario('Send one mail', () => {
    let address: SMTPServerAsPromisedServerAddress
    let client: SMTPConnectionAsPromised
    let info: SMTPConnectionSentMessageInfo
    let promise: Promise<any>
    let server: SMTPServerAsPromised

    Given('SMTPServerAsPromised object', () => {
      server = new SMTPServerAsPromised({
        hideSTARTTLS: true,
        onAuth
      })
    })

    When('listen method is used', async () => {
      address = await server.listen({ port: 0 })
    })

    Then('port number should be correct', () => {
      address.port.should.be.above(1024).and.below(65535)
    })

    When('I create new SMTPConnectionAsPromised object', () => {
      client = new SMTPConnectionAsPromised({
        ignoreTLS: true,
        port: address.port,
        logger: false
      })
    })

    And('I connect to the server', () => {
      promise = client.connect()
    })

    Then('promise for connect method is fulfilled', async () => {
      await promise.should.be.fulfilled
    })

    When('I login to the server', () => {
      promise = client.login({ user, pass })
    })

    Then('promise for login method is fulfilled', async () => {
      await promise.should.be.fulfilled
    })

    When('I send the message envelope and body', async () => {
      info = await client.send({ from, to }, rfc2822Message)
    })

    Then('promise for send method is fulfilled', () => {
      info.should.have.property('accepted').that.deep.equals(['recipient@example.net'])
      info.should.have.property('rejected').that.deep.equals([])
      info.should.have.property('response').that.equals('250 OK: message queued')
    })

    When('I reset the SMTP session', () => {
      promise = client.reset()
    })

    Then('promise for quit method is fulfilled', async () => {
      await promise.should.be.fulfilled
    })

    When('I quit the SMTP session', () => {
      promise = client.quit()
    })

    Then('promise for quit method is fulfilled', async () => {
      await promise.should.be.fulfilled
    })

    When('I close the SMTP session', () => {
      promise = client.close()
    })

    Then('promise for quit method is fulfilled', async () => {
      await promise.should.be.fulfilled
    })

    After(async () => {
      await client.close()
    })

    After(async () => {
      await server.close()
    })
  })
})