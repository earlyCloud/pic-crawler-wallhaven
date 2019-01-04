const fs = require('fs')
const Crawler = require('crawler')
const koa = require('koa')
const cheerio = require('cheerio')


let page = 1, 
args = process.argv.slice(2),
dist = './images/',
queryString = args.length ? args.join('+') : "",
emptyCount = 0

queryString && (dist = dist + queryString.replace(/\+/g, ' ') + '/')

getList()

function getImg(imgOption){
	const imgCrawler = new Crawler({
		encoding: null,
		jQuery: false,
		maxConnections: 10,
		headers: {
			'Host': 'alpha.wallhaven.cc',
			'Referer': 'https://alpha.wallhaven.cc',
			'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:61.0) Gecko/20100101 Firefox/61.0'
		},
		callback(err, res, done){
			if(err){
				console.log('err', err)
			}else{
				if(res.statusCode === 200){
					if(!fs.existsSync(dist)){
						fs.mkdirSync(dist)
					}
					const $ = res.$
					fs.createWriteStream(`${ dist }${ res.options.imgid }.jpg`).write(res.body)
					console.log(`${ res.options.imgid }.jpg complete`)
				}
			}
			done()
		}
	})
	imgCrawler.queue(imgOption)
}


function getDetailPage(imgArr = []){
	const pageCrawler = new Crawler({
		jQuery: 'cheerio',
		maxConnections : 10,
		callback(err, res, done){
			if(err){
				console.log(err)
			}else{
				if(res.statusCode === 200){
					let $ = res.$
					let imgid = $("#wallpaper").attr('data-wallpaper-id')
					let imgurl = `https://wallpapers.wallhaven.cc/wallpapers/full/wallhaven-${ imgid }.jpg`
					console.log(imgurl)
					getImg({
						uri: imgurl,
						imgid: imgid
					})
				}
			}
			done()
		}
	})
	pageCrawler.queue(imgArr)
}

function getList(){
	let urlArr = [], 
	url = `https://alpha.wallhaven.cc/search?q=${ queryString }&page=${ page }`,
	listCrawler = new Crawler({
		jQuery: 'cheerio',
		maxConnections: 10,
		skipDuplicates: true,
		callback(err, res, done){
			if(err){
				console.log(err)
			}else{
				let $ = res.$
				let links = $('section.thumb-listing-page a.preview')
				links.each((index, link) => {
					$(link).attr('href') && urlArr.push($(link).attr('href'))
				})
				console.log(`page: ${ page }`, urlArr)
				page ++ 
				getDetailPage(urlArr)
				if(urlArr.length){
					setTimeout(getList, 60000)
				}else if(emptyCount < 3){
					emptyCount ++ 
					getList()
				}else{
					console.log('no more list')
					/*process.exit(0)*/
				}
			}
			done()
		}
	})
	listCrawler.queue(url)
}


