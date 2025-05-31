import os
import re
import sys

def find_filters_in_templates():
    """البحث عن جميع الفلاتر المستخدمة في ملفات القوالب"""
    # نمط للبحث عن الفلاتر في القوالب
    pattern = re.compile(r'\{\{.*?\|([a-zA-Z0-9_]+).*?\}\}')
    
    # مجموعة لتخزين الفلاتر الفريدة
    filters = set()
    
    # البحث في جميع ملفات القوالب
    for root, dirs, files in os.walk('templates'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        matches = pattern.findall(content)
                        if matches:
                            filters.update(matches)
                            print(f"Found filters in {file_path}: {matches}")
                except Exception as e:
                    print(f"Error reading {file_path}: {str(e)}")
    
    # طباعة جميع الفلاتر الفريدة
    print("\nAll unique filters:")
    for filter_name in sorted(filters):
        print(f"- {filter_name}")
    
    return filters

if __name__ == "__main__":
    find_filters_in_templates()
