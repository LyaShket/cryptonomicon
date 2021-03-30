const API_KEY = "3193fd3274d9118ad05b42c5a31735864e32328f9a226a6b78cbbdaea7eb09cb"
const AGGREGATE_INDEX = "5"
const INVALID_SUB_TYPE = "500"
const INVALID_SUB = "INVALID_SUB"

let BTC_TO_USD = 0
let tickers = {}

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message["TYPE"] === AGGREGATE_INDEX && message["PRICE"]) {
        const currentTicker = message["FROMSYMBOL"]
        tickers[currentTicker].forEach(f => {
            f(message["PRICE"])
        })
    }
    else if (message["TYPE"] === INVALID_SUB_TYPE && message["MESSAGE"] === INVALID_SUB) {
        const currentTicker = message["PARAMETER"].slice(9, -4)
        tickers[currentTicker].forEach(f => {
            f("-")
        })
    }
})
subscribeTickerToUpdate("BTC", (newPrice) => {
    BTC_TO_USD = newPrice
})

export function subscribeTickerToUpdate(ticker, cb) {
    const currentTicker = Object.keys(tickers).indexOf(ticker) > -1 ? tickers[ticker] : []
    currentTicker.push(cb)
    tickers[ticker] = currentTicker
    subscribeTickerToWS(ticker)
}

export function unsubscribeTickerFromUpdate(ticker) {
    tickers[ticker] = []
    unsubscribeTickerFromWS(ticker)
}

function subscribeTickerToWS(ticker) {
    if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => {
            subscribeTickerToWS(ticker)
        }, { once: true })
        return
    }
    socket.send(JSON.stringify({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    }))
}

function unsubscribeTickerFromWS(ticker) {
    if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => {
            unsubscribeTickerFromWS(ticker)
        }, { once: true })
        return
    }
    socket.send(JSON.stringify({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~USD`]
    }))
}

window.tickers = tickers