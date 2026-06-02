const Joi = require('joi');

const createUserSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').optional(),
  initialBalance: Joi.number().min(0).max(1000000).default(0),
  role: Joi.string().valid('USER', 'SUPER_AGENT').default('USER')
});

const updateUserSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(50),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow(''),
  isActive: Joi.boolean(),
  isDisabled: Joi.boolean()
}).min(1);

const rechargeSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(100000).required(),
  description: Joi.string().max(200).allow('').optional()
});

const transferPointsSchema = Joi.object({
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(1000000).required(),
  percent: Joi.number().positive().max(100).required(),
  userName: Joi.string().allow('').optional(),
  userEmail: Joi.string().email().allow('').optional()
});

const statusUpdateSchema = Joi.object({
  disabled: Joi.boolean().required(),
  reason: Joi.string().max(500).allow('').optional()
});

const createAgentSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  username: Joi.string().alphanum().min(3).max(50).required(),
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).allow('').optional(),
  agentCode: Joi.string().alphanum().min(3).max(20).required(),
  commissionRate: Joi.number().min(0).max(100).default(5)
});

const createBetSchema = Joi.object({
  gameId: Joi.string().required(),
  userId: Joi.string().required(),
  amount: Joi.number().positive().max(10000).required(),
  numbers: Joi.array().items(Joi.number().min(1).max(99)).min(1).max(10).required()
});

const createGameSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  type: Joi.string().valid('CLASSIC', 'RAPID', 'JACKPOT').required(),
  minBet: Joi.number().positive().max(10000).default(1),
  maxBet: Joi.number().positive().max(100000).default(1000),
  startTime: Joi.date().iso().required(),
  endTime: Joi.date().iso().greater(Joi.ref('startTime')).required()
});

const updateSettingsSchema = Joi.object({
  minDeposit: Joi.number().min(0),
  maxDeposit: Joi.number().min(0),
  minWithdrawal: Joi.number().min(0),
  maxWithdrawal: Joi.number().min(0),
  maintenanceMode: Joi.boolean(),
  bannerMessage: Joi.string().max(500).allow('')
}).min(1);

module.exports = {
  createUserSchema,
  updateUserSchema,
  rechargeSchema,
  transferPointsSchema,
  statusUpdateSchema,
  createAgentSchema,
  createBetSchema,
  createGameSchema,
  updateSettingsSchema
};
