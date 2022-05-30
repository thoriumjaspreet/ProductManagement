const cartModel=require("../Models/cartModel")
const productModel = require("../models/productModel")
const userModel = require('../models/userModel')
const Validator = require('../Validator/valid')




const createCart = async function(req, res) {
  try{
  let userId = req.params.userId;
  let data = req.body
  let items2 

 let User= await userModel.findById(userId)
 if(!User) return res.status(404).send({ status: false, msg: "User not exist" })

  if (!Validator.isValidReqBody(data)) { return res.status(400).send({status: false, message: "Plaese Provide all required field" })
}

   let items = data.items
   if (typeof(items) == "string"){
      items = JSON.parse(items)
  }

let [{productId,  quantity}]=items

if(!Validator.isValid(productId)) return res.status(400).send({ status: false, msg: "product id is required" })

if (!Validator.isValidObjectId(productId))
return res.status(400).send({ status: false, message: "Invalid productId" })

if(!quantity) return res.status(400).send({ status: false, msg: "quantity is required" })

if (!(!isNaN(Number(quantity)))) {
  return res.status(400).send({ status: false, message: `Quantity should be a valid number` })
}
if (quantity <= 0) {
  return res.status(400).send({ status: false, message: `Quantity must be an integer !! ` })
}

   const isCartExist = await cartModel.findOne({userId:userId})
   let totalPrice = 0;
   if(!isCartExist){
      for(let i = 0; i < items.length; i++){
        let productId = items[i].productId
        let quantity = items[i].quantity

       
 
         let findProduct = await productModel.findOne({_id:productId,isDeleted:false});

      

         if(!findProduct){
          return res.status(400).send({status:false, message:"product is not valid or product is deleted"})
         }
         totalPrice = totalPrice + (findProduct.price*quantity)
       }
      let createCart = await cartModel.create({userId:userId,items:items,totalPrice:totalPrice,totalItems:items.length })
      let createItem = createCart.items
    let itemData = createItem.map(({productId, quantity}) => {
     return {productId, quantity};
    })
      return res.status(201).send({status:true,msg:"Create cart successfull",data:{_id:createCart._id,userId:createCart.userId,items:itemData,totalPrice:createCart.totalPrice,totalItems:createCart.totalItems,createdAt:createCart.createdAt,updatedAt:createCart.updatedAt}})
   } if(isCartExist){
        items2 = isCartExist.items
   }
      let findProduct = await productModel.findOne({_id:items[0].productId,isDeleted:false})
      if(!findProduct){
        return res.status(400).send({status:false, message:"product is not valid"})
       }
     // res.send(findProduct)
      let totalPrice2 = findProduct.price
      let newquantity = items[0].quantity
      let flag = 0
      
         for(let i = 0; i < items2.length; i++){
             let productId = items2[i].productId
          if(productId == items[0].productId){
                 flag = 1
                 items2[i].quantity = items2[i].quantity + newquantity}
             
 }    totalPrice2 = Math.round(totalPrice2 * newquantity + isCartExist.totalPrice) 
      if(flag == 0){
          items2.push(items[0])
      }
      let updateCart = await cartModel.findOneAndUpdate({userId:userId},{$set:{items:items2,totalPrice:totalPrice2,totalItems:items2.length}},{new:true})
    let update = updateCart.items

let itemData = update.map(({productId, quantity}) => {
  return {productId, quantity};
})
    return res.status(200).send({status:true,msg:"update cart successfully"
    ,data:{_id:updateCart._id,userId:updateCart.userId,items:itemData,totalPrice:updateCart.totalPrice,totalItems:updateCart.totalItems,createdAt:updateCart.createdAt,updatedAt:updateCart.updatedAt}})
 }catch (error) {
  return res.status(500).send({ status: false, ERROR: error.message })
}
}



//========================================================get cart=========================================================*

const getCart = async function(req, res) {
    try {
      let  userId = req.params.userId


        let User= await userModel.findById(userId)

        if(!User) {return res.status(404).send({ status: false, msg: 'user not found' })}
       
        let checkUser = await cartModel.findOne({ userId: userId })
        
        if (!checkUser) {
            return res.status(400).send({ status: false, msg: 'cart not found' })
        }
        let update = checkUser.items

        let itemData = update.map(({productId, quantity}) => {
          return {productId, quantity};
        })
        res.status(200).send({ status: true,msg:"success", data: {_id:checkUser._id,userId:checkUser.userId,items:itemData,totalPrice:checkUser.totalPrice,totalItems:checkUser.totalItems,createdAt:checkUser.createdAt,updatedAt:checkUser.updatedAt} })
    } catch (err) {
        res.status(500).send({ status: false, msg: err.message })
    }
}
//=======================================================delete cart=========================================================

const deleteCart = async function(req, res) {
    try {
      let  userId = req.params.userId
            
        //check if the document is found with that user id 

        let checkUser = await userModel.findById(userId)
        if (!checkUser) { return res.status(400).send({ status: false, msg: "user not found" })}

        let Cart= await cartModel.findOne({userId:userId})
        if(!Cart) {
          return res.status(404).send({ status: false, msg: "cart not exists"})
        }
      const items = []
        let cartDeleted = await cartModel.findOneAndUpdate({userId:userId}, 
          {$set: { items: items, totalItems: 0, totalPrice: 0 } }, { new: true })
      
    
       return res.status(200).send({ status: true, data: cartDeleted })
    } catch(err) {
        return res.status(500).send({ status: false, msg: err.message })

    }
}
module.exports={
  createCart,getCart,deleteCart
}