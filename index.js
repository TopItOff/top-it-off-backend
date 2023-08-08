const express = require('express')
const dbConnect = require('./config/dbConnect')
const app = express()
const dotenv = require('dotenv').config()
const PORT = process.env.PORT || 8080
const authRouter = require('./routes/authRoute')
const productRouter = require('./routes/productRoute')
const blogRouter = require('./routes/blogRoute');
const prodCategoryRoute = require('./routes/prodcategoryRoute')
const blogCategoryRoute = require('./routes/blogCategoryRouter')
const brandRouter = require('./routes/brandRoute')
const couponRouter = require('./routes/couponRoute')
const colorRouter = require('./routes/colorRoute')
const enquiryRouter = require('./routes/enqRoute')

const bodyParser = require('body-parser')
const { notFound, errorHandler } = require('./middlewares/errorHandler')
const cookieParser = require('cookie-parser');
const morgan = require('morgan')
dbConnect()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: false}))
app.use(cookieParser())

app.use(morgan("dev"))
app.use('/api/user', authRouter)
app.use('/api/product', productRouter)
app.use('/api/blog', blogRouter)
app.use('/api/category', prodCategoryRoute)
app.use('/api/blog-category', blogCategoryRoute)
app.use('/api/brand', brandRouter)
app.use('/api/coupon', couponRouter)
app.use('/api/color', colorRouter)
app.use('/api/enquiry', enquiryRouter)

app.use(notFound)
app.use(errorHandler)

app.listen(PORT, () => {
    console.log('Server running on port ' + PORT)
});