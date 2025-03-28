// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionControls = document.getElementById('compressionControls');
const previewArea = document.getElementById('previewArea');
const previewContainer = document.getElementById('previewContainer');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const formatSelect = document.getElementById('format');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');
const batchProgress = document.getElementById('batchProgress');
const progressFill = document.getElementById('progressFill');
const progressText = document.getElementById('progressText');

// 当前处理的图片数据
let currentFiles = [];

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩图片
function compressImage(file, quality, format) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        
        reader.onload = (event) => {
            const img = new Image();
            img.src = event.target.result;
            
            img.onload = () => {
                const canvas = document.createElement('canvas');
                const ctx = canvas.getContext('2d');
                
                // 保持原始尺寸
                canvas.width = img.width;
                canvas.height = img.height;
                
                // 绘制图片
                ctx.drawImage(img, 0, 0);
                
                // 确定输出格式
                let outputFormat = format;
                if (format === 'original') {
                    outputFormat = file.type.split('/')[1];
                }
                
                // 压缩
                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    `image/${outputFormat}`,
                    quality / 100
                );
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}

// 创建预览卡片
function createPreviewCard(file, compressedBlob) {
    const card = document.createElement('div');
    card.className = 'preview-box';
    
    card.innerHTML = `
        <h3>${file.name}</h3>
        <div class="preview-container">
            <div class="preview-box">
                <h3>原图</h3>
                <div class="image-container">
                    <img src="${URL.createObjectURL(file)}" alt="原图预览">
                </div>
                <div class="file-info">
                    <span>文件大小：</span>
                    <span>${formatFileSize(file.size)}</span>
                </div>
            </div>
            <div class="preview-box">
                <h3>压缩后</h3>
                <div class="image-container">
                    <img src="${URL.createObjectURL(compressedBlob)}" alt="压缩后预览">
                </div>
                <div class="file-info">
                    <span>文件大小：</span>
                    <span>${formatFileSize(compressedBlob.size)}</span>
                </div>
                <button class="secondary-button download-btn">下载压缩图片</button>
            </div>
        </div>
    `;
    
    // 添加下载按钮事件
    const downloadBtn = card.querySelector('.download-btn');
    downloadBtn.addEventListener('click', () => {
        const link = document.createElement('a');
        link.download = `compressed_${file.name}`;
        link.href = URL.createObjectURL(compressedBlob);
        link.click();
    });
    
    return card;
}

// 处理文件上传
function handleFileUpload(files) {
    if (!files.length) return;
    
    currentFiles = Array.from(files);
    
    // 显示控制区域
    compressionControls.style.display = 'block';
    previewArea.style.display = 'block';
    batchProgress.style.display = 'block';
    
    // 清空预览区域
    previewContainer.innerHTML = '';
    
    // 处理每个文件
    let processedCount = 0;
    
    currentFiles.forEach(async (file, index) => {
        try {
            const compressedBlob = await compressImage(
                file,
                qualitySlider.value,
                formatSelect.value
            );
            
            const card = createPreviewCard(file, compressedBlob);
            previewContainer.appendChild(card);
            
            processedCount++;
            progressFill.style.width = `${(processedCount / currentFiles.length) * 100}%`;
            progressText.textContent = `${processedCount}/${currentFiles.length}`;
            
            if (processedCount === currentFiles.length) {
                batchProgress.style.display = 'none';
            }
        } catch (error) {
            console.error('压缩失败:', error);
            alert(`压缩 ${file.name} 失败，请重试`);
        }
    });
}

// 事件监听器
uploadArea.addEventListener('click', () => fileInput.click());

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#0071e3';
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.style.borderColor = '#e0e0e0';
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.style.borderColor = '#e0e0e0';
    const files = e.dataTransfer.files;
    handleFileUpload(files);
});

fileInput.addEventListener('change', (e) => {
    const files = e.target.files;
    handleFileUpload(files);
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

compressBtn.addEventListener('click', async () => {
    if (!currentFiles.length) return;
    
    batchProgress.style.display = 'block';
    let processedCount = 0;
    
    for (const file of currentFiles) {
        try {
            const compressedBlob = await compressImage(
                file,
                qualitySlider.value,
                formatSelect.value
            );
            
            const card = createPreviewCard(file, compressedBlob);
            previewContainer.appendChild(card);
            
            processedCount++;
            progressFill.style.width = `${(processedCount / currentFiles.length) * 100}%`;
            progressText.textContent = `${processedCount}/${currentFiles.length}`;
        } catch (error) {
            console.error('压缩失败:', error);
            alert(`压缩 ${file.name} 失败，请重试`);
        }
    }
    
    batchProgress.style.display = 'none';
});

downloadBtn.addEventListener('click', () => {
    if (!compressedPreview.src) return;
    
    const link = document.createElement('a');
    link.download = `compressed_${currentFiles[0].name}`;
    link.href = compressedPreview.src;
    link.click();
}); 