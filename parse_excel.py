#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
解析Excel文件，统计不同岗位的薪资期望
"""

import pandas as pd
import sys
import json

def parse_excel(file_path):
    """解析Excel文件中的所有sheet"""
    try:
        # 读取Excel文件，使用pandas的默认引擎
        # 尝试不同的方式读取
        try:
            excel_file = pd.ExcelFile(file_path, engine='openpyxl')
        except:
            # 如果openpyxl失败，尝试使用calamine（更快且更健壮）
            import subprocess
            subprocess.run(['pip', 'install', '-q', 'python-calamine'], check=False)
            excel_file = pd.ExcelFile(file_path, engine='calamine')
        
        print(f"发现 {len(excel_file.sheet_names)} 个工作表: {excel_file.sheet_names}\n")
        
        all_data = []
        
        # 遍历所有sheet
        for sheet_name in excel_file.sheet_names:
            print(f"正在处理工作表: {sheet_name}")
            # 使用parse方法读取数据
            df = excel_file.parse(sheet_name)
            
            # 添加sheet来源列
            df['数据来源sheet'] = sheet_name
            all_data.append(df)
            
            print(f"  - 共 {len(df)} 行数据")
            print(f"  - 列名: {list(df.columns)}\n")
        
        # 合并所有数据
        combined_df = pd.concat(all_data, ignore_index=True)
        
        return combined_df, excel_file.sheet_names
        
    except Exception as e:
        print(f"错误: 无法读取Excel文件 - {e}")
        sys.exit(1)

def analyze_salary(df):
    """分析薪资期望数据"""
    
    # 打印所有列名，方便识别
    print("=" * 80)
    print("数据列名:")
    for i, col in enumerate(df.columns, 1):
        print(f"  {i}. {col}")
    print("=" * 80)
    print()
    
    # 尝试识别薪资和岗位相关的列
    salary_cols = [col for col in df.columns if any(keyword in str(col).lower() 
                   for keyword in ['薪资', '薪酬', '工资', 'salary', '期望'])]
    position_cols = [col for col in df.columns if any(keyword in str(col).lower() 
                     for keyword in ['岗位', '职位', 'position', 'job', '应聘', '面试'])]
    name_cols = [col for col in df.columns if any(keyword in str(col).lower() 
                 for keyword in ['姓名', 'name', '名字'])]
    
    print(f"识别到可能的薪资列: {salary_cols}")
    print(f"识别到可能的岗位列: {position_cols}")
    print(f"识别到可能的姓名列: {name_cols}")
    print()
    
    # 在所有列中搜索包含薪资信息的字段
    print("=" * 80)
    print("搜索包含薪资信息的记录...")
    print("=" * 80)
    
    # 在所有字符串列中搜索包含薪资关键词的内容
    salary_records = []
    
    for idx, row in df.iterrows():
        row_salary_info = {}
        found_salary = False
        
        for col in df.columns:
            cell_value = str(row[col])
            # 搜索包含薪资关键词的内容
            if any(keyword in cell_value for keyword in ['薪资', '薪酬', '工资', '期望薪', 'K/月', 'k/月']):
                row_salary_info['salary_field'] = col
                row_salary_info['salary_content'] = cell_value
                found_salary = True
        
        if found_salary:
            # 添加基本信息
            if name_cols:
                row_salary_info['name'] = row[name_cols[0]]
            if position_cols:
                row_salary_info['position'] = row[position_cols[0]]
            row_salary_info['sheet'] = row.get('数据来源sheet', '')
            
            salary_records.append(row_salary_info)
    
    print(f"找到 {len(salary_records)} 条包含薪资信息的记录\n")
    
    if salary_records:
        print("=" * 80)
        print("【所有填写薪资期望的人员名单】")
        print("=" * 80)
        print()
        
        # 按岗位分组统计
        position_groups = {}
        
        for record in salary_records:
            position = record.get('position', '未知岗位')
            if position not in position_groups:
                position_groups[position] = []
            position_groups[position].append(record)
        
        # 打印每个岗位的薪资信息
        for position, records in sorted(position_groups.items()):
            print(f"\n【{position}】 共 {len(records)} 人")
            print("-" * 80)
            for i, record in enumerate(records, 1):
                name = record.get('name', '未知')
                salary = record.get('salary_content', '')
                sheet = record.get('sheet', '')
                field = record.get('salary_field', '')
                
                print(f"{i}. 姓名: {name}")
                print(f"   薪资信息: {salary}")
                print(f"   数据来源: {sheet} - {field}列")
                print()
        
        # 保存结果
        output_file = '/Users/gavenhwang/Documents/Code/QoderProjects/mcp-tools/薪资统计结果.csv'
        result_df = pd.DataFrame(salary_records)
        result_df.to_csv(output_file, index=False, encoding='utf-8-sig')
        print(f"\n结果已保存到: {output_file}")
    else:
        print("警告: 未找到任何包含薪资信息的记录")
        print("将显示前5行数据供参考:")
        print(df.head(5).to_string())

if __name__ == "__main__":
    file_path = '/Users/gavenhwang/Documents/Code/QoderProjects/mcp-tools/2025年HPC招聘数据表.xlsx'
    
    print("开始解析Excel文件...")
    print("=" * 80)
    
    # 解析Excel
    df, sheet_names = parse_excel(file_path)
    
    # 分析薪资数据
    analyze_salary(df)
    
    print("\n处理完成！")
