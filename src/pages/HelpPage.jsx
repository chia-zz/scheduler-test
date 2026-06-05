import { useState } from 'react';
import { useApp } from '../context/AppContext';

function Section({ title, children }) {
  return (
    <section className='card p-5'>
      <h2 className='mb-2 font-display text-lg font-semibold text-main'>
        {title}
      </h2>
      <div className='space-y-2 text-sm leading-relaxed text-main'>
        {children}
      </div>
    </section>
  );
}

export default function HelpPage({ onBack }) {
  return (
    <div className='min-h-screen bg-bg'>
      <div>
        <h1 className='font-display text-xl font-bold text-main'>說明</h1>
        <p className='text-sm text-sub'>
          大家豪！這裡是排班小工具的操作流程說明。
          <br />
          建議依下列順序進行：先建立員工與班別順序，再針對每個月份排班。
        </p>
      </div>
      <main className='mx-auto space-y-5 py-6'>
        <Section title='1. 登入與首頁'>
          <p>
            第一次開啟會請你設定一組管理密碼；之後每次重新開啟需輸入密碼（重新整理頁面不需要）。
          </p>
          <p>
            登入後會看到「月份首頁」，以年為單位顯示 12
            個月，標示「已建立／未建立」與「本月」。點任一月份即進入該月編輯；在編輯畫面點左上角
            logo 可回到首頁。
          </p>
        </Section>

        <Section title='2. 員工設定（員工頁）'>
          <p>
            新增 / 編輯 / 刪除員工，選擇身分（正職 / 兼職），並設定顏色與 emoji
            頭像。正職只會被排到白天開店班（預設）。
          </p>
        </Section>

        <Section title='3. 班別排班順序（班別順序頁）'>
          <p>
            每種班別各有一份優先順序清單，<b>數字越小越優先</b>
            。自動排班會依此順序填入第一位「當天可上」的員工。
          </p>
          <p>
            <b>沒被列入清單的員工＝不排該班別</b>
            ，所以「某人只能上某些班別」就用這裡控制。
          </p>
        </Section>

        <Section title='4. 排班流程（排班頁）'>
          <p className='text-sub'>建議依序操作：</p>
          <ol className='list-decimal space-y-1.5 pl-5'>
            <li>
              <b>確認國定假日</b>
              ：進入某月會自動帶入內建假日，上方橫幅按「前往確認」勾選；可「從網路更新」或手動新增（如颱風假）。國定假日當天兼職時數
              ×2。
            </li>
            <li>
              <b>設定特殊日</b>（可選）：設整天公休，或關閉 /
              修改某班別時間（如晚上提早打烊、平日下午才開門）。
            </li>
            <li>
              <b>設定不可上班</b>
              ：選員工後，在小月曆點選他當月不可上班的日期（可用全選 / 清除）。
            </li>
            <li>
              <b>自動排班</b>：可先調整「兼職時數平均 /
              照順序」與正職的「月休天數」，再按「自動排班」。
            </li>
            <li>
              <b>手動微調</b>
              ：點月曆任一格可改指派的人、留空、改時間，或把某天設為正職休假。手動改過的格子會被鎖定，重新自動排班時不會被覆蓋。
            </li>
            <li>
              <b>匯出班表</b>：按「匯出班表」預覽並下載整月 PNG。
            </li>
          </ol>
          <p className='mt-2'>
            警告標示：<span className='text-warning'>橘色</span>
            ＝該員工連續上班超過 5 天（僅提醒）；
            <span className='text-error'>紅色「未排」</span>
            ＝找不到人，請放寬不可上班、調整順序或手動指派。
          </p>
        </Section>

        <Section title='5. 時數統整'>
          <p>
            右側即時顯示每人天數與時數。兼職遇國定假日時數
            ×2，正職不加倍；正職另顯示本月休假天數。
          </p>
        </Section>

        <Section title='6. 資料與備份'>
          <p>
            所有資料只存在你這台電腦的這個瀏覽器。如有需要請到「設定 → 匯出 JSON
            備份」備份；換電腦或瀏覽器時，於另一台「匯入」即可還原與同步。
          </p>
        </Section>
      </main>
    </div>
  );
}
