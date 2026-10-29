// 1. إعدادات الاتصال بقاعدة بيانات Supabase
const SUPABASE_URL = 'ضع_رابط_المشروع_هنا_Project_URL';
const SUPABASE_ANON_KEY = 'ضع_المفتاح_العام_هنا_anon_key';

const { createClient } = supabase;
const _supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// 2. التشغيل التلقائي عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    initDynamicForms();
    initDynamicTables();
});

// أ) التعرف التلقائي على النماذج وإرسال البيانات بناءً على اسم الحقل (name)
function initDynamicForms() {
    const forms = document.querySelectorAll('form[data-table]');
    
    forms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();
            const tableName = form.getAttribute('data-table');
            
            // جمع البيانات ديناميكياً من كل حقل يمتلك خاصية name
            const formData = new FormData(form);
            const dataObject = {};
            formData.forEach((value, key) => {
                dataObject[key] = value;
            });

            // إرسال البيانات إلى جدول Supabase المحدد تلقائياً
            const { error } = await _supabase.from(tableName).insert([dataObject]);

            if (error) {
                console.error('خطأ في الحفظ:', error.message);
                alert('فشل حفظ البيانات: ' + error.message);
            } else {
                alert('تم الحفظ بنجاح!');
                form.reset();
                initDynamicTables5(); // تحديث الجدول تلقائياً إن وجد
            }
        });
    });
}

// ب) التعرف التلقائي على الأعمدة وعرضها في جدول ديناميكي
async function initDynamicTables() {
    const containers = document.querySelectorAll('[data-auto-table]');
    
    for (const container of containers) {
        const tableName = container.getAttribute('data-auto-table');
        
        const { data, error } = await _supabase
            .from(tableName)
            .select('*');

        if (error) {
            console.error('خطأ في جلب البيانات:', error.message);
            continue;
        }

        if (!data || data.length === 0) {
            container.innerHTML = '<p>لا توجد بيانات حالياً.</p>';
            continue;
        }

        // استخراج أسماء الأعمدة ديناميكياً من أول صف بيانات قادم من قاعدة البيانات
        const columns = Object.keys(data[0]);

        // بناء جدول HTML تلقائياً
        let tableHTML = '<table border="1" style="width:150px; border-collapse: collapse; text-align: right;"><thead><tr style="background:#f2f2f2;">';
        
        columns.forEach(col => {
            tableHTML += `<th style="padding: 8px; border: 1px solid #ddd;">${col}</th>`;
        });
        tableHTML += '</tr></thead><tbody>';

        data.forEach(row => {
            tableHTML += '<tr>';
            columns.forEach(col => {
                tableHTML += `<td style="padding: 8px; border: 1px solid #ddd;">${row[col] !== null ? row[col] : ''}</td>`;
            });
            tableHTML += '</tr>';
        });

        tableHTML += '</tbody></table>';
        container.innerHTML = tableHTML;
    }
}