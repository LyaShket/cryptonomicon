const API_KEY = "3193fd3274d9118ad05b42c5a31735864e32328f9a226a6b78cbbdaea7eb09cb"
const AGGREGATE_INDEX = "5"
const INVALID_SUB_TYPE = "500"
const INVALID_SUB = "INVALID_SUB"

let exchange = { btcToUsd: 0 }
let tickers = {}

const socket = new WebSocket(`wss://streamer.cryptocompare.com/v2?api_key=${API_KEY}`)
socket.addEventListener('message', event => {
    const message = JSON.parse(event.data)
    if (message["TYPE"] === AGGREGATE_INDEX && message["PRICE"]) {
        const currentTicker = message["FROMSYMBOL"]

        const exchangeTicker = message["TOSYMBOL"]
        let newPrice = message["PRICE"]
        if (exchangeTicker === "BTC") {
            newPrice *= exchange.btcToUsd
        }

        tickers[currentTicker].forEach(f => {
            f(newPrice)
        })
    }
    else if (message["TYPE"] === INVALID_SUB_TYPE && message["MESSAGE"] === INVALID_SUB) {
        const currentTicker = message["PARAMETER"].slice(9, -4)

        let newPrice = "-"
        if (currentTicker === "BTC") {
            newPrice = exchange.btcToUsd
        }

        tickers[currentTicker].forEach(f => {
            f(newPrice)
        })
    }
})
subscribeTickerToUpdate("BTC", (newPrice) => {
    exchange.btcToUsd = newPrice
}, "USD")

export function subscribeTickerToUpdate(ticker, cb, currency = "BTC") {
    const currentTicker = Object.keys(tickers).indexOf(ticker) > -1 ? tickers[ticker] : []
    currentTicker.push(cb)
    tickers[ticker] = currentTicker
    subscribeTickerToWS(ticker, currency)
}

export function unsubscribeTickerFromUpdate(ticker, currency = "BTC") {
    tickers[ticker] = []
    unsubscribeTickerFromWS(ticker, currency)
}

function subscribeTickerToWS(ticker, currency) {
    if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => {
            subscribeTickerToWS(ticker, currency)
        }, { once: true })
        return
    }
    socket.send(JSON.stringify({
        "action": "SubAdd",
        "subs": [`5~CCCAGG~${ticker}~${currency}`]
    }))
}

function unsubscribeTickerFromWS(ticker, currency) {
    if (socket.readyState === WebSocket.CONNECTING) {
        socket.addEventListener('open', () => {
            unsubscribeTickerFromWS(ticker, currency)
        }, { once: true })
        return
    }
    socket.send(JSON.stringify({
        "action": "SubRemove",
        "subs": [`5~CCCAGG~${ticker}~${currency}`]
    }))
}

window.tickers = tickers
window.exchange = exchange