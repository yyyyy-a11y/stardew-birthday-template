const wishTime = '待确认'
const birthdayConfig = {
  celebrant: '寿星', pinyin: 'BIRTHDAY', age: 'XX',
  birthdayDate: '2030-10-01T18:00:00+08:00', dateDot: '2030 · 10 · 01',
  dateCn: '2030年10月1日 · 星期二', calendarDay: '01', calendarYear: '2030', season: '秋',
  wishTime,
  // 替换 gallery 中的 src / alt / caption，即可展示寿星自己的照片
  gallery: [
    { src: '/assets/pelican-town.webp', alt: '鹈鹕镇风景', caption: '出发去参加派对' },
    { src: '/assets/the-summit.png', alt: '山顶景色', caption: '一起走到山顶' },
    { src: '/assets/marriage-scene.webp', alt: '星露谷合影', caption: '留下特别合影' },
    { src: '/assets/title-screen.png', alt: '星露谷标题画面', caption: '新一岁的冒险开始' },
  ],
  schedule: [
    { label: '抵达鹈鹕镇', time: '待确认', description: '在派对小屋集合，领取今日任务' },
    { label: '点亮生日蜡烛', time: wishTime, description: '唱生日歌，见证寿星许下新愿望' },
    { label: '星之果实宴会', time: '待确认', description: '分享蛋糕、游戏和当日限定菜单' },
    { label: '保存快乐存档', time: '待确认', description: '拍下全员合影，完成特别委托' },
  ],
}

const values = { ...birthdayConfig }
document.querySelectorAll('[data-content]').forEach((el) => {
  const key = el.dataset.content
  if (key in values && key !== 'schedule' && key !== 'gallery') el.textContent = values[key]
})

const target = new Date(birthdayConfig.birthdayDate)
document.querySelector('#days-count').textContent = Math.max(0, Math.ceil((target - Date.now()) / 86400000))

const grid = document.querySelector('#calendar-grid')
const year = target.getFullYear(), month = target.getMonth(), eventDay = target.getDate()
const offset = (new Date(year, month, 1).getDay() + 6) % 7
const total = new Date(year, month + 1, 0).getDate()
for (let i = 0; i < offset; i += 1) grid.append(document.createElement('i'))
for (let day = 1; day <= total; day += 1) {
  const cell = document.createElement(day === eventDay ? 'button' : 'span')
  cell.textContent = day
  if (day === eventDay) { cell.className = 'birthday-day'; cell.setAttribute('aria-label', `生日派对，${day}日`); cell.innerHTML += '<b>★</b>' }
  grid.append(cell)
}

const questList = document.querySelector('[data-content="schedule"]')
birthdayConfig.schedule.forEach((item, index) => {
  const row = document.createElement('button')
  row.type = 'button'; row.className = 'quest-row'
  row.innerHTML = `<i></i><span><b>${item.label}<small>${item.time}</small></b><em>${item.description}</em></span>`
  row.addEventListener('click', () => { row.classList.toggle('done'); updateQuest() })
  questList.append(row)
})
function updateQuest() {
  const done = document.querySelectorAll('.quest-row.done').length
  document.querySelector('#quest-count').textContent = `${done} / ${birthdayConfig.schedule.length}`
  document.querySelector('#quest-progress').style.width = `${done / birthdayConfig.schedule.length * 100}%`
}

const photoGallery = document.querySelector('#photo-gallery')
const lightbox = document.querySelector('#photo-lightbox')
const lightboxImage = document.querySelector('#lightbox-image')
const lightboxCaption = document.querySelector('#lightbox-caption')
const lightboxCounter = document.querySelector('#lightbox-counter')
let currentPhoto = 0
let lastPhotoTrigger = null

birthdayConfig.gallery.forEach((photo, index) => {
  const card = document.createElement('button')
  card.type = 'button'
  card.className = 'photo-card'
  card.setAttribute('aria-label', `查看照片：${photo.caption || photo.alt || index + 1}`)
  const img = document.createElement('img')
  img.src = photo.src
  img.alt = photo.alt || ''
  img.loading = 'lazy'
  img.decoding = 'async'
  const caption = document.createElement('span')
  caption.textContent = photo.caption || ''
  card.append(img, caption)
  card.addEventListener('click', () => { lastPhotoTrigger = card; openPhoto(index) })
  photoGallery.append(card)
})

function openPhoto(index) {
  currentPhoto = (index + birthdayConfig.gallery.length) % birthdayConfig.gallery.length
  const photo = birthdayConfig.gallery[currentPhoto]
  lightboxImage.src = photo.src
  lightboxImage.alt = photo.alt || ''
  lightboxCaption.textContent = photo.caption || ''
  lightboxCounter.textContent = `${currentPhoto + 1} / ${birthdayConfig.gallery.length}`
  lightbox.hidden = false
  document.body.style.overflow = 'hidden'
  document.querySelector('[data-lightbox-close]').focus()
}
function closePhoto() {
  lightbox.hidden = true
  document.body.style.overflow = ''
  lastPhotoTrigger?.focus()
}
function stepPhoto(step) { openPhoto(currentPhoto + step) }

document.querySelector('[data-lightbox-close]').addEventListener('click', closePhoto)
document.querySelector('[data-lightbox-prev]').addEventListener('click', () => stepPhoto(-1))
document.querySelector('[data-lightbox-next]').addEventListener('click', () => stepPhoto(1))
lightbox.addEventListener('click', (event) => { if (event.target === lightbox) closePhoto() })
document.addEventListener('keydown', (event) => {
  if (lightbox.hidden) return
  if (event.key === 'Escape') closePhoto()
  if (event.key === 'ArrowLeft') stepPhoto(-1)
  if (event.key === 'ArrowRight') stepPhoto(1)
})

let gifted = false
document.querySelectorAll('[data-gift]').forEach((button) => button.addEventListener('click', () => {
  gifted = true
  document.querySelectorAll('[data-gift]').forEach((item) => item.classList.remove('selected'))
  button.classList.add('selected')
  document.querySelector('#heart-meter').textContent = '♥ ♥ ♥ ♥ ♥'
  document.querySelector('#gift-reaction').textContent = `“哇！${button.dataset.gift}，这是我最喜欢的！” 友情 +640`
}))

document.querySelectorAll('[data-scroll]').forEach((button) => button.addEventListener('click', () => document.querySelector(button.dataset.scroll)?.scrollIntoView({ behavior: 'smooth' })))
const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches
const reveal = document.querySelectorAll('.reveal')
if (!reduced && 'IntersectionObserver' in window) {
  const observer = new IntersectionObserver((entries) => entries.forEach((entry) => { if (entry.isIntersecting) { entry.target.classList.add('visible'); observer.unobserve(entry.target) } }), { threshold: .12 })
  reveal.forEach((el) => observer.observe(el))
} else reveal.forEach((el) => el.classList.add('visible'))

const music = document.querySelector('#birthday-music'), musicButton = document.querySelector('#music-toggle')
music.volume = .22
musicButton.addEventListener('click', async () => {
  if (music.paused) { try { await music.play(); musicButton.classList.add('playing'); musicButton.setAttribute('aria-pressed', 'true') } catch {} }
  else { music.pause(); musicButton.classList.remove('playing'); musicButton.setAttribute('aria-pressed', 'false') }
})
