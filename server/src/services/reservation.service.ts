import { randomUUID } from "crypto";
import { redis } from "../config/redis";

const reservationKey = (token: string) => `flashkart:reservation:${token}`;
const stockKey = (productId: number) => `flashkart:stock:${productId}`;

const reserveScript = `
local stock = tonumber(redis.call('GET', KEYS[1]) or '-1')
local qty = tonumber(ARGV[1])
if stock < 0 then return -2 end
if stock < qty then return -1 end
redis.call('DECRBY', KEYS[1], qty)
redis.call('HSET', KEYS[2], 'productId', ARGV[2], 'userId', ARGV[3], 'quantity', ARGV[1])
redis.call('EXPIRE', KEYS[2], ARGV[4])
return 1
`;

const releaseScript = `
local exists = redis.call('EXISTS', KEYS[1])
if exists == 0 then return 0 end
local qty = tonumber(redis.call('HGET', KEYS[1], 'quantity') or '0')
if qty > 0 then redis.call('INCRBY', KEYS[2], qty) end
redis.call('DEL', KEYS[1])
return qty
`;

const consumeScript = `
local exists = redis.call('EXISTS', KEYS[1])
if exists == 0 then return 0 end
redis.call('DEL', KEYS[1])
return 1
`;

export async function ensureProductStock(productId: number, stock: number) {
    const key = stockKey(productId);
    if (!(await redis.exists(key))) {
        await redis.set(key, stock);
    }
}

export async function reserveStock(
    productId: number,
    userId: number,
    quantity: number
) {
    const token = randomUUID();
    const result = await redis.eval(reserveScript, {
        keys: [stockKey(productId), reservationKey(token)],
        arguments: [
            String(quantity),
            String(productId),
            String(userId),
            String(`${process.env.RESERVATION_TTL_SECONDS}`),
        ],
    });
    if (result === -2) throw new Error("STOCK_NOT_INITIALIZED");
    if (result === -1) throw new Error("INSUFFICIENT_STOCK");
    return {
        token,
        expiresAt: new Date(
            Date.now() + Number(process.env.RESERVATION_TTL_SECONDS) * 1000
        ),
    };
}

export async function releaseReservation(token: string, productId: number) {
    return redis.eval(releaseScript, {
        keys: [reservationKey(token), stockKey(productId)],
        arguments: [],
    });
}

export async function consumeReservation(token: string) {
    return redis.eval(consumeScript, {
        keys: [reservationKey(token)],
        arguments: [],
    });
}

export async function getReservation(token: string) {
    const data = await redis.hGetAll(reservationKey(token));
    return Object.keys(data).length ? data : null;
}
