<template>
  <div id="app">
    <div class="container mx-auto flex flex-col items-center bg-gray-100 p-4">
      <div class="fixed w-100 h-100 opacity-80 bg-purple-800 inset-0 z-50 flex items-center justify-center"
           v-if="isLoading">
        <svg class="animate-spin -ml-1 mr-3 h-12 w-12 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      </div>
      <div class="container">
        <div class="w-full my-4"></div>
        <section>
          <div class="flex">
            <div class="max-w-xs">
              <label for="wallet" class="block text-sm font-medium text-gray-700"
              >Тикер</label
              >
              <div class="mt-1 relative rounded-md shadow-md">
                <input
                    type="text"
                    name="wallet"
                    id="wallet"
                    class="block w-full pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                    placeholder="Например DOGE"
                    v-model="addTickerTextComputed"
                    @keypress.enter="addTicker"
                />
              </div>
              <div class="flex bg-white shadow-md p-1 rounded-md shadow-md flex-wrap" v-if="hints.length">
                <span class="inline-flex items-center px-2 m-1 rounded-md text-xs font-medium bg-gray-300 text-gray-800 cursor-pointer"
                      v-for="(hint, index) in hints"
                      :key="index"
                      @click="addTickerWithHint(hint)">
                  {{ hint }}
                </span>
              </div>
              <div class="text-sm text-red-600" v-if="doAddTickerExist">Такой тикер уже добавлен</div>
            </div>
          </div>
          <button
              type="button"
              class="my-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
              @click="addTicker"
          >
            <!-- Heroicon name: solid/mail -->
            <svg
                class="-ml-0.5 mr-2 h-6 w-6"
                xmlns="http://www.w3.org/2000/svg"
                width="30"
                height="30"
                viewBox="0 0 24 24"
                fill="#ffffff"
            >
              <path
                  d="M13 7h-2v4H7v2h4v4h2v-4h4v-2h-4V7zm-1-5C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z"
              ></path>
            </svg>
            Добавить
          </button>
        </section>

        <template v-if="tickers.length">
          <hr class="w-full border-t border-gray-600 my-4" />

          <div>
            <div class="mb-3">
              <button class="mr-4 inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      v-if="page > 1"
                      @click="page -= 1">
                Previous
              </button>
              <button class="inline-flex items-center py-2 px-4 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-full text-white bg-gray-600 hover:bg-gray-700 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                      v-if="doNextPageExist"
                      @click="page += 1">
                Next
              </button>
            </div>
            <div>Filter: <input type="text"
                                class="pr-10 border-gray-300 text-gray-900 focus:outline-none focus:ring-gray-500 focus:border-gray-500 sm:text-sm rounded-md"
                                v-model="filter"></div>
          </div>

          <hr class="w-full border-t border-gray-600 my-4" />

          <dl class="mt-5 grid grid-cols-1 gap-5 sm:grid-cols-3">
            <div
                class="bg-white overflow-hidden shadow rounded-lg border-purple-800 border-solid cursor-pointer"
                v-for="ticker in paginatedTickers"
                :key="ticker.name"
                :class="{
                  'border-4': ticker === selectedTicker,
                  'bg-red-100': !ticker.isValid
                }"
                @click="selectTicker(ticker)"
            >
              <div class="px-4 py-5 sm:p-6 text-center">
                <dt class="text-sm font-medium text-gray-500 truncate">
                  {{ ticker.name }} - USD
                </dt>
                <dd class="mt-1 text-3xl font-semibold text-gray-900">
                  {{ formatPrice(ticker.price) }}
                </dd>
              </div>
              <div class="w-full border-t border-gray-200"></div>
              <button
                  class="flex items-center justify-center font-medium w-full bg-gray-100 px-4 py-4 sm:px-6 text-md text-gray-500 hover:text-gray-600 hover:bg-gray-200 hover:opacity-20 transition-all focus:outline-none"
                  @click.stop="deleteTicker(ticker)"
              >
                <svg
                    class="h-5 w-5"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="#718096"
                    aria-hidden="true"
                >
                  <path
                      fill-rule="evenodd"
                      d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                      clip-rule="evenodd"
                  ></path></svg>Удалить
              </button>
            </div>
          </dl>
          <template v-if="selectedTicker">
            <hr class="w-full border-t border-gray-600 my-4" />
            <section class="relative">
              <h3 class="text-lg leading-6 font-medium text-gray-900 my-8">
                {{ selectedTicker.name }} - USD
              </h3>
              <div class="flex items-end border-gray-600 border-b border-l h-64" ref="history">
                <div
                    class="bg-purple-800 border w-10"
                    v-for="(h, index) in calculatedHistory"
                    :key="index"
                    :style="{'height': h + '%'}"
                ></div>
              </div>
              <button
                  type="button"
                  class="absolute top-0 right-0"
                  @click="closeTicker"
              >
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    xmlns:svgjs="http://svgjs.com/svgjs"
                    version="1.1"
                    width="30"
                    height="30"
                    x="0"
                    y="0"
                    viewBox="0 0 511.76 511.76"
                    style="enable-background:new 0 0 512 512"
                    xml:space="preserve"
                >
              <g>
                <path
                    d="M436.896,74.869c-99.84-99.819-262.208-99.819-362.048,0c-99.797,99.819-99.797,262.229,0,362.048    c49.92,49.899,115.477,74.837,181.035,74.837s131.093-24.939,181.013-74.837C536.715,337.099,536.715,174.688,436.896,74.869z     M361.461,331.317c8.341,8.341,8.341,21.824,0,30.165c-4.16,4.16-9.621,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    l-75.413-75.435l-75.392,75.413c-4.181,4.16-9.643,6.251-15.083,6.251c-5.461,0-10.923-2.091-15.083-6.251    c-8.341-8.341-8.341-21.845,0-30.165l75.392-75.413l-75.413-75.413c-8.341-8.341-8.341-21.845,0-30.165    c8.32-8.341,21.824-8.341,30.165,0l75.413,75.413l75.413-75.413c8.341-8.341,21.824-8.341,30.165,0    c8.341,8.32,8.341,21.824,0,30.165l-75.413,75.413L361.461,331.317z"
                    fill="#718096"
                    data-original="#000000"
                ></path>
              </g>
            </svg>
              </button>
            </section>
          </template>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import {subscribeTickerToUpdate, unsubscribeTickerFromUpdate} from "@/api";

export default {
  name: 'App',
  data() {
    return {
      addTickerText: "",
      filter: "",
      tickers: [],
      selectedTicker: null,

      history: [],
      historyMaxSize: 1,

      isLoading: true,
      tickerHints: [],
      doAddTickerExist: false,
      page: 1,
      currentUrl: null
    }
  },
  computed: {
    addTickerTextComputed: {
      get() {
        return this.addTickerText
      },
      set(newValue) {
        this.doAddTickerExist = false
        this.addTickerText = newValue
      }
    },
    doNextPageExist() {
      return this.filteredTickers.length > this.page * 6
    },
    filteredTickers() {
      return this.tickers.filter(ticker => ticker.name.indexOf(this.filter.toUpperCase()) !== -1)
    },
    paginatedTickers() {
      const firstSplice = (this.page - 1) * 6
      const secondSplice = firstSplice + 6

      return this.filteredTickers.slice(firstSplice, secondSplice)
    },
    hints() {
      const hints = []
      this.tickerHints.forEach(tickerHint => {
        tickerHint.hints.forEach(hint => {
          if (hint.indexOf(this.addTickerTextComputed.toUpperCase()) !== -1
              && hints.indexOf(tickerHint.tickerName) === -1)
            hints.push(tickerHint.tickerName)
        })
      })
      hints.sort((a, b) => {
        if (a.length < b.length)
          return -1
        if (a.length > b.length)
          return 1
        return 0
      })
      hints.length = hints.length > 4 ? 4 : hints.length

      return hints
    },
    adaptiveHistory() {
      const adaptiveHistory = [...this.history]

      while (adaptiveHistory.length > this.historyMaxSize) {
        adaptiveHistory.shift()
      }

      return adaptiveHistory
    },
    calculatedHistory() {
      const minValue = Math.min(...this.adaptiveHistory)
      const maxValue = Math.max(...this.adaptiveHistory)
      const difference = maxValue - minValue ? maxValue - minValue : 1

      if (minValue === maxValue)
        return this.adaptiveHistory.map(() => 50)
      return this.adaptiveHistory.map(h => (h - minValue) / difference * 95 + 5)
    },
  },
  created() {
    if (localStorage.getItem("tickers-list") !== null)
      this.tickers = JSON.parse(localStorage.getItem("tickers-list"))

    this.tickers.forEach(ticker => {
      subscribeTickerToUpdate(ticker.name, newPrice => {
        ticker.price = newPrice
        if (newPrice === "-") {
          ticker.isValid = false
        }
        if (this.selectedTicker === ticker) {
          this.history.push(newPrice)
        }
      })
    })

    this.currentUrl = new URL(window.location)
    let searchParams = this.currentUrl.searchParams
    this.page = searchParams.get("page") ? +searchParams.get("page") : 1
    this.filter = searchParams.get("filter") ? searchParams.get("filter") : ""
  },
  mounted() {
    addEventListener('resize', this.calculateHistoryMaxSize)
    fetch("https://min-api.cryptocompare.com/data/all/coinlist?summary=true")
        .then(response => response.json())
        .then(responseData => {
          const data = responseData.Data
          Object.keys(data).forEach(key => {
            this.tickerHints.push({
              tickerName: key,
              hints: [
                data[key].Symbol.toUpperCase(),
                data[key].FullName.toUpperCase()
              ]
            })
          })
          this.isLoading = false
        })
  },
  beforeDestroy() {
    removeEventListener('resize', this.calculateHistoryMaxSize)
  },
  methods: {
    calculateHistoryMaxSize() {
      if (!this.$refs.history) {
        return
      }
      console.log("ok")
      this.historyMaxSize = this.$refs.history.offsetWidth / 40 + 1
    },
    setHistoryParam(param, value) {
      this.currentUrl.searchParams.set(param, value)
      history.pushState({}, '', this.currentUrl)
    },
    selectTicker(ticker) {
      if (this.selectedTicker === ticker)
        return

      this.selectedTicker = ticker
    },
    addTicker() {
      if (!this.addTickerTextComputed)
        return

      if (this.tickers.filter(ticker => ticker.name === this.addTickerTextComputed.toUpperCase()).length) {
        this.doAddTickerExist = true
        return
      }
      else
        this.doAddTickerExist = false

      const newTicker = {
        name: this.addTickerTextComputed.toUpperCase(),
        price: "-",
        isValid: true,
      }
      this.addTickerTextComputed = ""

      this.tickers = [newTicker, ...this.tickers]

      subscribeTickerToUpdate(newTicker.name, newPrice => {
        newTicker.price = newPrice
        if (newPrice === "-") {
          newTicker.isValid = false
        }
        if (this.selectedTicker === newTicker) {
          this.history.push(newPrice)
        }
      })
    },
    closeTicker() {
      this.selectedTicker = null
      this.history = []
    },
    deleteTicker(ticker) {
      if(this.selectedTicker === ticker)
        this.closeTicker()

      this.tickers.splice(this.tickers.indexOf(ticker), 1)
      unsubscribeTickerFromUpdate(ticker.name)
    },
    addTickerWithHint(hint) {
      this.addTickerTextComputed = hint
      this.addTicker()
    },
    formatPrice(price) {
      if (price === "-")
        return price
      let formattedPrice = price.toFixed(5)
      return formattedPrice.replace(/0*$/,"")
    }
  },
  watch: {
    filter() {
      this.page = 1
      this.setHistoryParam("filter", this.filter)
    },
    page() {
      this.setHistoryParam("page", this.page)
    },
    tickers() {
      localStorage.setItem("tickers-list", JSON.stringify(this.tickers))
    },
    selectedTicker() {
      this.history = []
      this.$nextTick(this.calculateHistoryMaxSize)
    }
  }
}
</script>

<style></style>