import express from "express"
import axios from "axios"
import moment from "moment"
import bodyParser from "body-parser"

const app = express()
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json())

const baseURL = "https://sandbox.safaricom.co.ke"

const http = axios.create({
  baseURL,
})

const consumerKey = "k2kUBR4MaUD5crCNK2nVGHMsqzWT5z5a"
const consumerSecret = "AxcgdsAl2SUeZg8r"
const passKey = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919"



const data =   {
  "BusinessShortCode": "174379" ,
  "TransactionType": "CustomerPayBillOnline",
  "CallBackURL": "https://5df07c53.ngrok.io/callback",
}

app.get('/generate', async(req, res) => {
  const auth = "Basic " + new Buffer(consumerKey + ":" + consumerSecret).toString("base64");
  const url = "/oauth/v1/generate?grant_type=client_credentials"
  try {
    const response = await http.get(url, { headers: { Authorization: auth }})
    http.defaults.headers.common['Authorization'] = `Bearer ${response.data.access_token}`;
    res.send(response.data)

  } catch (e) {
    console.log(e)
  }

})

app.post('/push', async(req, res) => {
  const { phone, amount } = req.body
  const timestamp = moment().format("YYYYMMDDHHmmss")
  console.log(timestamp)
  const Password = new Buffer(`${data.BusinessShortCode}${passKey}${timestamp}`).toString("base64");
  const request = {
     ...data,
      PhoneNumber: phone,
      Amount: amount,
      Timestamp: timestamp,
      Password,
      PartyA: phone,
      PartyB: data.BusinessShortCode,
      AccountReference: "Test",
      TransactionDesc: "Test"
  }
  try {
    const response = await http.post('/mpesa/stkpush/v1/processrequest', request)
  } catch(e) {
    console.log(e)
    console.log("ERROR", e.response.data.errorMessage)
  }
})

app.post('/callback', async(req, res) => {
  console.log(req )
})

app.listen(3000, () => console.log("Running dev server"))