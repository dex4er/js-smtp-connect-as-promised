#!/usr/bin/env ts-node

import * as fs from 'fs'
import MailComposer = require('nodemailer/lib/mail-composer')

import { SMTPConnectionAsPromised, SMTPConnectionOptions } from '../lib/smtp-connection-as-promised'

interface ArgvOptions {
  [key: string]: string
}

interface Options extends SMTPConnectionOptions {
  from: string
  to: string
  user?: string
  pass?: string
  data?: string
}

async function main () {
  // Usage: node test-smtp-client.js host=localhost port=25 ignoreTLS=true user=u pass=p from=a@example.com to=b@example.net data=-
  const defaultOptions: Options = {
    opportunisticTLS: true,
    from: 'sender@example.com',
    to: 'recpient@example.net'
  }
  const userOptions: ArgvOptions = Object.assign({}, ...process.argv.slice(2).map((a) => a.split('=')).map(([k, v]) => ({ [k]: v })))

  const options: Options = { ...defaultOptions, ...userOptions }
  const { from, to, user, pass } = options

  const message = options.data === '-' ? process.stdin
    : !options.data ? new MailComposer({ from, to }).compile().createReadStream()
    : fs.readFileSync(options.data)

  const envelope: MailComposer.Envelope = { from, to: [to] }

  const connection = new SMTPConnectionAsPromised(options)

  try {
    await connection.connect()
    if (user && pass) {
      await connection.login({ user, pass })
    }
    const info = await connection.send(envelope, message)
    console.info(info)
    await connection.quit()
  } catch (e) {
    console.error(e)
    await connection.close()
  }
}

main().catch(console.error)
