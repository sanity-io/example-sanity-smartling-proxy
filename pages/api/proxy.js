import { initMiddleware, corsOptionsDelegate } from '../../utils'
import Cors from 'cors'

const cors = initMiddleware(Cors(corsOptionsDelegate))

const proxy = async (req, res) => {
  await cors(req, res)
  //we have to clean up headers that come from CORs from the studio
  const headers = {}

  const validHeaders = [
    'authorization',
    'content-type',
    'client-id',
    'select-record',
    'api-version',
    'grant_type',
  ]

  validHeaders.forEach(header => {
    if (req.headers[header]) {
      headers[header] = req.headers[header]
    }
  })

  const proxyRequest = { headers }

  if (req.body) {
    proxyRequest.method = 'POST'
    if (
      req.headers['content-type'] == 'application/json' &&
      typeof req.body != 'string'
    ) {
      proxyRequest.body = JSON.stringify(req.body)
    } else {
      proxyRequest.body = req.body
    }
  }

  let returnStatus = 200

  const proxyResponse = await fetch(req.headers['x-url'], proxyRequest).then(
    async proxyResponse => {
      returnStatus = proxyResponse?.status || 200
      if (proxyResponse.headers.get('content-type').includes('json')) {
        return proxyResponse.json()
      } else {
        const chunks = []

        for await (const chunk of proxyResponse.body) {
          chunks.push(chunk)
        }

        return {
          body: Buffer.concat(chunks).toString(),
        }
      }
    },
  )

  proxyResponse.headers = res.headers

  res.status(returnStatus).send(proxyResponse)
}

export default proxy