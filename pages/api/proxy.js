import { authenticate, initMiddleware, corsOptionsDelegate } from '../../utils'
import Cors from 'cors'

const cors = initMiddleware(Cors(corsOptionsDelegate))

const proxy = async (req, res) => {
  await cors(req, res)
  //we have to clean up headers that come from CORs from the studio
  const headers = {}
  const validHeaders = ['authorization', 'content-type', 'client-id', 'grant_type']
  validHeaders.forEach(header => {
    if (req.headers[header]) {
      headers[header] = req.headers[header]
    }
  })
  const proxyRequest = { headers }

  if (req.body) {
    proxyRequest.method = 'POST'
    if (req.headers['content-type'] == 'application/json' && typeof(req.body) != 'string') {
      proxyRequest.body = JSON.stringify(req.body)
    } else {
      proxyRequest.body = req.body
    }
  }

  const proxyResponse = await fetch(req.headers['x-url'], proxyRequest)
    .then(res => {
      if (res.headers.get('content-type').includes('application/json')) {
        return res.json()
      } else {
        const chunks = []
        res.body.on('data', chunk => chunks.push(chunk)) 
        return new Promise((resolve, reject) => {
          res.body.on('end', () => {
            resolve({body: Buffer.concat(chunks).toString()})
          })
        })
      }
    })


  res.status(200).send(proxyResponse)
}

export default proxy
