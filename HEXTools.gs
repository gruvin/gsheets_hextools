// v0.1.4
const EtherscanAPIKey = "PASTE YOUR ETHERSCAN API KEY HERE"   // add an API Key at: https://etherscan.io/myapikey

// no longer needed thanks to https://github.com/HexCommunity/HEX-APIs
//const NomicsAPIKey = "PASTE YOUR NOMICS API KEY HERE"         // get your key here: https://p.nomics.com/cryptocurrency-bitcoin-api/

// Please see README.md for more information

///////////////////////////////////////////////////////////////////////////////////////////////////////

const HEX = "0x2b591e99afe9f32eaa6214f7b7629768c40eeb39"

//import BigNumber from 'bignumber.mjs'


function fetchJSONObject(urlString) {
  const jsondata = UrlFetchApp.fetch(urlString)
  return JSON.parse(jsondata.getContentText())
}

// returns object of request results 
function EtherscanRequest(paramsObject) {
  var url = "https://api.etherscan.io/api?tag=latest&apikey="+EtherscanAPIKey
  for (let param in paramsObject) url += "&"+param+"="+paramsObject[param]
  const r = fetchJSONObject(url)
  if (r.error)
    return { error: r.code, message: r.message }
  else if (r.message && r.result && r.result === "NOT_OK") {
    return { error: (-1), message: r.result }
  } else {
    return r
  }
}

function NomicsRequest(endpointString, paramsObject) {
  var url = "https://api.nomics.com/v1/"+endpointString+"?key="+NomicsAPIKey
  for (let param in paramsObject) url += "&"+param+"="+paramsObject[param]
  return fetchJSONObject(url)
}

// to get value of NZD in USD => CurrencyRate("NZD", "USD")
function CurrencyRate(fromString, toString) {
  const url = "http://www.floatrates.com/daily/"+fromString.toLowerCase()+".json"
  const results = fetchJSONObject(url)
  return parseFloat(results[toString.toLowerCase()].rate)
}

// nomics.com
function HEXUSD2() {
  const results = NomicsRequest("currencies/ticker", {ids: "HEX"})
  return parseFloat(results[0].price)
}


// https://github.com/HexCommunity/HEX-APIs
function HEXUSD() {
  let results = fetchJSONObject("https://uniswapdataapi.azurewebsites.net/api/hexPrice")
  return parseFloat(results.hexUsd)
}  


function HEXBalance(address) {
  const jsonObject = EtherscanRequest({
    module: "account",
    action: "tokenBalance",
    contractAddress: HEX,
    address: address
  });
  return (parseFloat(jsonObject.result)) / 1E8
}

function HEXDay() {
  const HEXLaunchDate = new Date('2019-12-02T00:00:00Z')
  return Math.floor((Date.now() - HEXLaunchDate) / (1000 * 3600 * 24))
}

function ETHBalance(address) {
  const jsonObject = EtherscanRequest({
    module: "account",
    action: "balance",
    address: address
  });
  return (parseFloat(jsonObject.result)) / 1E18
}

function ETHPriceUSD() {
  const jsonObject = EtherscanRequest({
    module: "stats",
    action: "ethprice"
  });
  return (parseFloat(jsonObject.result.ethusd))
}

function refreshHEXFormulae() {
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = activeSpreadsheet.getActiveSheet()
  var range = sheet.getDataRange()
  var numCols = range.getNumColumns()
  var numRows = range.getNumRows()
  var rowOffset = range.getRow()
  var colOffset = range.getColumn()

  // Change formulae to values, flush, then change them back ...
  
  //`row` and `col` are relative to the range, not the sheet
  var formulae = range.getFormulas();
  var hexFormulae = []
  for (var row=0; row<numRows; row++) {
    for (var col=0; col<numCols; col++) {
      var f = formulae[row][col]
      // ignore non-HEXTools formulae now, to save time later
      if (typeof f === "string" && f.match(/HEXUSD\(|HEXBalance\(|HEXDay\(|CurrencyRate\(/gi)) {
        var r = row+rowOffset
        var c = col+colOffset
        var cell = range.getCell(r, c)
        hexFormulae.push({ row: r, col: c, formula: f })
        cell.setValue(cell.getValue())
      }
    }
  } 
  SpreadsheetApp.flush();
  hexFormulae.forEach((entry) => {
    range.getCell(entry.row, entry.col).setFormula(entry.formula)
  })
  SpreadsheetApp.flush()  
}

function getContractABI(address) {
  return EtherscanRequest({ 
    module: "contract", 
    to: HEX,
    action: "getabi",
    address: address
  })
}


function contractCall(method, params) {
  if (typeof params !== "object") return null
  "&action=eth_call&to="+HEX+"&data="
  let data="0x"+method
  params.forEach(p => { data += p.toString().replace(/^0x/i, "").padStart(64, '0') })
  const r = EtherscanRequest({ 
    module: "proxy", 
    to: HEX,
    action: "eth_call",
    data: data
  })
  if (r.error) return r
  
  return r.result.replace(/^0x/, '')
}

function stakeCount(address) {
  const r = contractCall("33060d90", [address])
  if (r.error) return r
  return new BigNumber("0x"+r).toNumber()
}
  
function getStake(address, index) {
  const r = contractCall("2607443b", [ address, index ])
  if (r.error) return r
  
  const f = r.match(/.{1,64}/g)
  const seg1 = {
    Id:          new BigNumber("0x"+f[0]).toString(),
    principal:   new BigNumber("0x"+f[1]).div(1e8).toNumber(),
    TShares:     new BigNumber("0x"+f[2]).div(1e12).toNumber(),
    startDay:    new BigNumber("0x"+f[3]).toNumber(),
    stakeDays:   new BigNumber("0x"+f[4]).toNumber(),
  }
  return { 
    ...seg1, 
    endDay: (seg1.startDay + seg1.stakeDays + 1),
    unlockedDay: new BigNumber("0x"+f[4]).toNumber(),
    isAutoStake: new BigNumber("0x"+f[5]).toNumber() === 1
  }
}

function _StakeList(address) {
  const count = stakeCount(address)
  if (count.error) return r

  rows = []
  for (i = 0; i < count; i++) {
    const r = getStake(address, i);
    if (r.error) return r
    rows.push(r) 
  }
  return rows
}

function StakeList(address, includeHeader /*true*/) {
  if (typeof address === 'undefined') address = '0xD30542151ea34007c4c4ba9d653f4DC4707ad2d2'
  if (typeof includeHeader === 'undefined') includeHeader = true
  var activeSpreadsheet = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = activeSpreadsheet.getActiveSheet()
  var range = sheet.getDataRange()
  var numCols = range.getNumColumns()
  var numRows = range.getNumRows()
  var rowOffset = range.getRow()
  var colOffset = range.getColumn()

  var stakes = _StakeList(address)
  var result = []
  if (includeHeader) result.push([
      'stake ID',
      'principal',
      'T-Shares',
      'Start Day',
      'End Day',
      'Days',
      'Auto-stake?'
    ]
  )

  stakes.forEach(stakeData => {
    var row = [
      stakeData.Id, 
      stakeData.principal,
      stakeData.TShares,
      stakeData.startDay,
      stakeData.endDay,
      stakeData.stakeDays,
      stakeData.isAutoStake ? 'Yes' : 'No'
    ]
    result.push(row)
  })
  return result
}

function onOpen() {
  var sheet = SpreadsheetApp.getActiveSpreadsheet();
  var entries = [{
    name : "Refresh HEX Formulae",
    functionName : "refreshHEXFormulae"
  }];
  sheet.addMenu("HEX Tools", entries);
};

///////////////////////////////////////////////////////////////////////////////////////////////////////

function test() {
  console.log(HEXDay())
  console.log("HEX-APIs: "+HEXUSD())
  console.log("Nomics: "+HEXUSD2())
  console.log(CurrencyRate("NZD", "USD").toFixed(3))
  console.log("HEXBalance: "+HEXBalance("0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c"))
  console.log("ETHBalance: "+ETHBalance("0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c"))
  console.log("ETHPriceUSD: "+ETHPriceUSD())
}

function test2() {
  const addr = "0xF834b3E4040E13C5acd6a2Ed0D51592085863E7c"
  console.log(stakeCount(addr))
  console.log(getStake(addr, 0))
  console.log(StakeList(addr))
}
