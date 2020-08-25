const axios = require('axios')
const cheerio = require('cheerio')
const cron = require('node-cron')
const nodemailer = require('nodemailer')

const fetchPrice = async (url, targetPrice) => {
	const response = await axios.get(url)
	const html = response.data
	const $ = cheerio.load(html)
	const priceText = $('#priceblock_ourprice').text()
	const price = parseFloat(priceText.replace('$', ''))

	if (targetPrice >= price) {
		console.log(`our price: ${targetPrice} amazon price:  ${price}`)
		sendEmail(url, price)
	} else {
		console.log(`our price: ${targetPrice} amazon price:  ${price}`)
	}
}

const sendEmail = async (url, price) => {
	const testAccount = await nodemailer.createTestAccount()
	const transport = nodemailer.createTransport({
		host: 'smtp.ethereal.email',
		port: 587,
		secure: false,
		auth: {
			user: testAccount.user,
			pass: testAccount.pass,
		},
	})
	const info = await transport.sendMail({
		from: '"UI Infinity" <test@test.com>',
		to: 'test@test.com',
		subject: 'amazon watcher',
		text: `${price} - ${url}`,
		html: `<p>${price}</p><p>${url}</p>`,
	})
	console.log(nodemailer.getTestMessageUrl(info))
}

const watchPrice = (url, priceTarget, schedule = '*/20 * * * * *') => {
	cron.schedule(schedule, () => fetchPrice(url, priceTarget))
}

watchPrice(
	'https://www.amazon.com/Jabra-Wireless-Noise-Canceling-Headphones-Copper/dp/B07RS8CFJZ/',
	348.0
)
