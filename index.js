'use strict'
const process = require('process')
const execa = require('execa')

var argv = require('yargs')
  .options({
    l: {
      alias: 'low',
      default: false,
      describe: 'Exit even for low vulnerabilities',
      type: 'boolean'
    },
    m: {
      alias: 'moderate',
      default: false,
      describe: 'Exit only when moderate or above vulnerabilities',
      type: 'boolean'
    },
    h: {
      alias: 'high',
      default: false,
      describe: 'Exit only when high or above vulnerabilities',
      type: 'boolean'
    },
    c: {
      alias: 'critical',
      default: true,
      describe: 'Exit only for critical vulnerabilities',
      type: 'boolean'
    }
  })
  .help('help').argv

const fail = (severityType, count) => {
  console.log(
    `FAILURE :: there are some ${severityType} security vulnerabilities :: ${count}`
  )
  process.exit(1)
}

const run = () => {
  execa.shell('npm audit --json').then(
    (result) => {},
    (result) => {
      const res = JSON.parse(result.stdout)

      const {
        info,
        low,
        moderate,
        high,
        critical
      } = res.metadata.vulnerabilities

      if (argv.critical && critical > 0) {
        return fail('CRITICAL', critical)
      }

      if (argv.high && (critical > 0 || high > 0)) {
        return fail('HIGH', high)
      }

      if (argv.moderate && (critical > 0 || high > 0 || moderate > 0)) {
        return fail('MODERATE', moderate)
      }

      if (argv.low && (critical > 0 || high > 0 || moderate > 0 || low > 0)) {
        return fail('LOW', low)
      }
    }
  )
}

module.exports = run
