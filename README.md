# Taskorator

> Automatically generate daily tasks based on customizable templates and schedule tags..

---

### 📦 [View All Releases](https://github.com/omr-cyber/Taskorator/releases)
[![GitHub All Releases](https://img.shields.io/github/downloads/omr-cyber/Taskorator/total?style=for-the-badge)](https://github.com/omr-cyber/Taskorator/releases)

---

[English](#english) | [العربية](#arabic) | [中文](#chinese)

---

<a name="english"></a>
## English

### 🚀 Key Features

- 🤖 **Smart Generation**: Automatically creates tasks every day or only on workdays.
- 🗂️ **Dual Storage Modes**: 
    - **Monthly Archive**: Organizes tasks elegantly in `Year/Month.md`.
    - **Single File Focus**: Keep your "Today" view in one dedicated file (e.g., `Today.md`).
- 🎨 **Powerful Templates**: Fully customize your layouts with dynamic variables.
- 📆 **Conditional Logic**: Use `#every` tags to schedule tasks for specific days, months, or workdays.
- 💬 **Comment Support**: Ignore any line by starting it with `//`.

### 🪄 Template Variables & Tags

#### Available Variables:
| Variable | Description |
| :--- | :--- |
| `{{date}}` | Current date (YYYY-MM-DD) |
| `{{dateWithIcon}}` | Current date with a daily icon |
| `{{weekday}}` | Localized day of the week |
| `{{time}}` | Current rendering time (HH:MM) |

#### Smart Scheduling Tags (`#every`):
Add these at the end of a line or a heading to control when they appear:
- `#every-day`: Appear every single day.
- `#every-workday`: Appear only Monday through Friday.
- `#every(mon, wed)`: Appear only on specific days.
- `#every(jan(1,15))`: Appear on specific days of a specific month.
- `#every(month(1))`: Appear on a specific day of every month.

> **Note**: Lines starting with `//` will be completely ignored, regardless of tags.

### 📥 Installation

1. Download `main.js`, `manifest.json`, and `styles.css` from the **[Latest Release](https://github.com/omr-cyber/Taskorator/releases)**.
2. Create `vault/.obsidian/plugins/taskorator/` and place the files there.
3. Enable "Taskorator" in **Settings > Community Plugins**.

---

<a name="arabic"></a>
## العربية

### 🚀 المميزات الرئيسية

- 🤖 **توليد ذكي**: إنشاء المهام تلقائياً كل يوم أو في أيام العمل فقط.
- 🗂️ **وضعان للتخزين**:
    - **أرشيف شهري**: تنظيم المهام بشكل أنيق في مسار `السنة/الشهر.md`.
    - **ملف واحد مركز**: احتفظ برؤية "اليوم" في ملف واحد مخصص (مثل `Today.md`).
- 🎨 **قوالب قوية**: خصص تخطيطاتك بالكامل باستخدام متغيرات ديناميكية.
- 📆 **منطق شرطي**: استخدم وسوم `#every` لجدولة المهام في أيام أو أشهر محددة.
- 💬 **دعم التعليقات**: تجاهل أي سطر ببدئه بـ `//`.

### 🪄 متغيرات القالب والوسوم

#### المتغيرات المتاحة:
| المتغير | الوصف |
| :--- | :--- |
| `{{date}}` | التاريخ الحالي (YYYY-MM-DD) |
| `{{dateWithIcon}}` | التاريخ الحالي مع أيقونة يومية |
| `{{weekday}}` | اسم اليوم الحالي |
| `{{time}}` | وقت التوليد الحالي (HH:MM) |

#### وسوم الجدولة الذكية (`#every`):
أضف هذه الوسوم في نهاية السطر أو العنوان للتحكم في وقت ظهورها:
- `#every-day`: تظهر كل يوم.
- `#every-workday`: تظهر من الاثنين إلى الجمعة فقط.
- `#every(mon, wed)`: تظهر في أيام محددة فقط.
- `#every(jan(1,15))`: تظهر في أيام محددة من شهر محدد.
- `#every(month(1))`: تظهر في يوم محدد من كل شهر.

> **ملاحظة**: أي سطر يبدأ بـ `//` سيتم تجاهله تماماً، بغض النظر عن الوسوم.

### 📥 التثبيت

1. قم بتحميل `main.js` و `manifest.json` و `styles.css` من **[صفحة الإصدارات](https://github.com/omr-cyber/Taskorator/releases)**.
2. أنشئ مجلد `vault/.obsidain/plugins/taskorator/` وضع الملفات فيه.
3. فعل "Taskorator" من **الإعدادات > الإضافات الخارجية**.

---

<a name="chinese"></a>
## 中文

### 🚀 核心功能

- 🤖 **智能生成**: 每天或仅在工作日自动创建任务。
- 🗂️ **双重存储模式**:
    - **按月归档**: 按 `年份/月份.md` 优雅地组织任务。
    - **单一文件聚焦**: 将“今日”视图保持在一个专用文件中（例如 `Today.md`）。
- 🎨 **强大模板**: 使用动态变量完全自定义您的布局。
- 📆 **条件逻辑**: 使用 `#every` 标签安排特定日期、月份或工作日的任务。
- 💬 **注释支持**: 通过以 `//` 开头来忽略任何行。

### 🪄 模板变量与标签

#### 可用变量:
| 变量 | 描述 |
| :--- | :--- |
| `{{date}}` | 当前日期 (YYYY-MM-DD) |
| `{{dateWithIcon}}` | 带图标的当前日期 |
| `{{weekday}}` | 当地星期几 |
| `{{time}}` | 当前渲染时间 (HH:MM) |

#### 智能调度标签 (`#every`):
在行尾或标题末尾添加这些标签以控制其显示时间：
- `#every-day`: 每天显示。
- `#every-workday`: 仅在周一至周五显示。
- `#every(mon, wed)`: 仅在特定日期显示。
- `#every(jan(1,15))`: 在特定月份的特定日期显示。
- `#every(month(1))`: 在每月的特定日期显示。

> **注意**: 以 `//` 开头的行将被完全忽略，无论是否有标签。

### 📥 安装

1. 从 **[发布页面](https://github.com/omr-cyber/Taskorator/releases)** 下载 `main.js`、`manifest.json` 和 `styles.css`。
2. 创建 `vault/.obsidian/plugins/taskorator/` 文件夹并将文件放入其中。
3. 在 **设置 > 社区插件** 中启用 "Taskorator"。

---



