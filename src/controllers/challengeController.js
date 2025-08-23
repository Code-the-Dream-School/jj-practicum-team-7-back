const Challenge = require('../models/Challenge')
const { categories} = require ('../models/Challenge')

const { StatusCodes } = require('http-status-codes')
const { BadRequestError } = require('../errors');

const createChallenge = async (req,res) => {
    const { title, category, duration, invited } = req.body;
   try{
    if(!title || typeof title !== 'string'){
     throw new BadRequestError(`Let's name your challenge to get started!`)
    }
    if(title.length < 5){
     throw new BadRequestError(`That title's a bit short - try at least 5 characters`);
    }
     if (title.length > 50) {
       throw new BadRequestError('Short and sweet titles work best - try under 50 characters!');
     }
    if (!category || !categories.includes(category)){
        throw new BadRequestError(`Please choose a category from the list`)
    }
    if (!duration || typeof duration !== 'number' || duration < 1) {
      throw new BadRequestError('Duration must be at least 1 day');
    }
    const challenge = await Challenge.create({
        title,
        category,
        duration,
        creator: req.user.id,
        participant:[req.user.id],
        invited: invited || []
    })
    return res.status(StatusCodes.CREATED).json({ challenge });
   }
   catch (error){
    if (error.name === 'MongoServerError' && error.code === 11000) {
      throw new BadRequestError('Oops, you already have a challenge with that title!');
    }
    return res
      .status(StatusCodes.INTERNAL_SERVER_ERROR)
      .json({ message: 'Failed to create challenge' });
   }
}
module.exports = {createChallenge}