#### 1. Check các file đã thay đổi (dùng cho những lần sau)
git fetch origin          # cập nhật thông tin mới từ GitHub
git status                # xem tình trạng file local
git log --oneline -10     # 10 commit gần nhất
git diff main origin/main # xem chi tiết khác biệt local vs GitHub

### 2. Đồng bộ — kéo code mới nhất về
git fetch origin
git reset --hard origin/main   # ép local giống hệt GitHub (bỏ thay đổi local)
### 3. lệnh update code lên git
git status	
git add .
git commit -m "..."	
git push origin main
git push origin dev1 (ví dụ đẩy lên branch)
### check ở branch hay main
0. nếu tự  tạo branch trên GIT thì cần update để source biết có branch mới: 
git fetch origin
1. git branch - nếu có * thì là ở đó
2. git checkout dev1 /// hoặc git checkout main