'use strict'

const { Sentence, Edge } = require('./../db/index')

const router = require('express').Router()
// const graphNodes = require('./../../hegel_parser')
let fs = require('fs')

let getGraphData = require('./getGraphData')

router.get('/hegel', async (req, res, next)=>{
	
	res.json(JSON.stringify(blank))
	res.end()
})

router.get('/hegel/data', async (req, res, next)=>{
  
  let graphData = await getGraphData(req.query)

  res.json(JSON.stringify(graphData))

  res.end()
})

router.get('/hegel/data/sentences', async (req, res, next)=>{
  
	console.log(req.query)
	// { source: '181', target: '635' }

  let edges = await Edge.findAll({
  	where: {
		sourceId : req.query.source,
		targetId : req.query.target
  	}
  })

  let payload = []

  for( let edge of edges){

  	let thisLoad = await Sentence.findById(edge.locationId)

  	payload.push(thisLoad)

  }

  payload = payload.map(sentence => sentence.dataValues)

  res.json(JSON.stringify(payload))

  res.end()
})

router.use((req, res, next) => {
  const err = new Error('API route not found!')
  err.status = 404
  next(err)
})

module.exports = router
