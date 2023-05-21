const express = require('express');
const router = express.Router();
const mealController = require('../controllers/meal.controller');

router.post('/', mealController.createMeal); //UC-301
router.put('/:mealId', mealController.updateMeal); //UC-302
router.get('/', mealController.getAllMeals); //UC-303
router.get('/:mealId', mealController.getMeal); //UC-304
router.delete('/:mealId', mealController.deleteMeal); //UC-305
    
module.exports = router