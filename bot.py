import asyncio
import json
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.utils.keyboard import InlineKeyboardBuilder
from aiogram.types import LabeledPrice, PreCheckoutQuery

# --- НАСТРОЙКИ ---
TOKEN = "ТВОЙ_ТОКЕН_БОТА"
CHANNEL_ID = "@твой_канал"  # Канал для подписки
WEB_APP_URL = "https://твоя-ссылка-на-vercel.app" 
MANAGER_ID = 12345678 # Твой ID

bot = Bot(token=TOKEN)
dp = Dispatcher()

# --- ПРОВЕРКА ПОДПИСКИ ---
async def check_sub(user_id):
    try:
        member = await bot.get_chat_member(CHANNEL_ID, user_id)
        return member.status not in ['left', 'kicked']
    except:
        return False

# --- START ---
@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    is_sub = await check_sub(message.from_user.id)
    
    if not is_sub:
        kb = InlineKeyboardBuilder()
        kb.button(text="📢 ПОДПИСАТЬСЯ", url=f"https://t.me/{CHANNEL_ID.replace('@', '')}")
        kb.button(text="✅ ПРОВЕРИТЬ", callback_data="check_sub")
        await message.answer(
            "⛔ <b>ДОСТУП ЗАПРЕЩЕН</b>\n\n"
            "Чтобы войти в <b>ACID CASINO</b>, подпишись на канал!",
            parse_mode="HTML", reply_markup=kb.as_markup()
        )
    else:
        await send_casino_menu(message)

# --- МЕНЮ КАЗИНО ---
async def send_casino_menu(message: types.Message):
    kb = InlineKeyboardBuilder()
    kb.button(text="🚀 ЗАЛЕТЕТЬ В ИГРУ", web_app=types.WebAppInfo(url=WEB_APP_URL))
    
    await message.answer(
        "🧪 <b>ACID CASINO WELCOME</b>\n\n"
        "Ракета заправлена, мины расставлены.\n"
        "🔥 Кислотный дизайн\n"
        "💸 Вывод через менеджера\n"
        "💎 NFT инвентарь",
        parse_mode="HTML", reply_markup=kb.as_markup()
    )

# --- CALLBACK ПРОВЕРКИ ---
@dp.callback_query(F.data == "check_sub")
async def callback_check(callback: types.CallbackQuery):
    if await check_sub(callback.from_user.id):
        await callback.message.delete()
        await send_casino_menu(callback.message)
    else:
        await callback.answer("❌ Ты не подписался!", show_alert=True)

# --- ОПЛАТА STARS (Приходит от WebApp) ---
@dp.message(F.content_type == types.ContentType.WEB_APP_DATA)
async def web_app_data(message: types.Message):
    data = json.loads(message.web_app_data.data)
    if data['action'] == 'invoice_stars':
        await bot.send_invoice(
            message.chat.id,
            title="Пополнение баланса",
            description="50 Звезд для игры",
            payload="stars_topup",
            currency="XTR", # Валюта звезд
            prices=[LabeledPrice(label="50 ⭐", amount=50)],
            provider_token="" # Пустой для Stars
        )

# Подтверждение оплаты
@dp.pre_checkout_query()
async def process_pre_checkout(query: PreCheckoutQuery):
    await bot.answer_pre_checkout_query(query.id, ok=True)

@dp.message(F.successful_payment)
async def success_pay(message: types.Message):
    await message.answer(f"✅ Оплата прошла! {message.successful_payment.total_amount} звезд зачислены.")
    # Тут код начисления баланса в базу данных

async def main():
    await dp.start_polling(bot)

if __name__ == "__main__":
    asyncio.run(main())