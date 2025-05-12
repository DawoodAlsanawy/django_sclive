import os
import re
import sys

def find_selectattr_in_templates():
    """البحث عن استخدام فلتر selectattr في ملفات القوالب"""
    # نمط للبحث عن فلتر selectattr في القوالب
    pattern = re.compile(r'\|selectattr:')
    
    # البحث في جميع ملفات القوالب
    for root, dirs, files in os.walk('templates'):
        for file in files:
            if file.endswith('.html'):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        content = f.read()
                        if pattern.search(content):
                            print(f"Found selectattr in {file_path}")
                            # استخراج السطور التي تحتوي على فلتر selectattr
                            lines = content.split('\n')
                            for i, line in enumerate(lines):
                                if '|selectattr:' in line:
                                    print(f"  Line {i+1}: {line.strip()}")
                except Exception as e:
                    print(f"Error reading {file_path}: {str(e)}")

if __name__ == "__main__":
    find_selectattr_in_templates()
