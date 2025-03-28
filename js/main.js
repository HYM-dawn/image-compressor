// 获取DOM元素
const uploadArea = document.getElementById('uploadArea');
const fileInput = document.getElementById('fileInput');
const compressionControls = document.getElementById('compressionControls');
const previewArea = document.getElementById('previewArea');
const originalPreview = document.getElementById('originalPreview');
const compressedPreview = document.getElementById('compressedPreview');
const originalSize = document.getElementById('originalSize');
const compressedSize = document.getElementById('compressedSize');
const qualitySlider = document.getElementById('quality');
const qualityValue = document.getElementById('qualityValue');
const compressBtn = document.getElementById('compressBtn');
const downloadBtn = document.getElementById('downloadBtn');

// 当前处理的图片数据
let currentFile = null;

// 格式化文件大小
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// 压缩图片
function compressImage(file, quality) {
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
                
                // 压缩
                canvas.toBlob(
                    (blob) => {
                        resolve(blob);
                    },
                    file.type,
                    quality / 100
                );
            };
            
            img.onerror = reject;
        };
        
        reader.onerror = reject;
    });
}

// 处理文件上传
function handleFileUpload(file) {
    if (!file.type.match('image.*')) {
        alert('请上传图片文件！');
        return;
    }
    
    currentFile = file;
    
    // 显示原图
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
        originalPreview.src = e.target.result;
        originalSize.textContent = formatFileSize(file.size);
        
        // 显示控制区域
        compressionControls.style.display = 'block';
        previewArea.style.display = 'block';
        
        // 压缩图片
        compressImage(file, qualitySlider.value).then(blob => {
            compressedPreview.src = URL.createObjectURL(blob);
            compressedSize.textContent = formatFileSize(blob.size);
        });
    };
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
    const file = e.dataTransfer.files[0];
    handleFileUpload(file);
});

fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    handleFileUpload(file);
});

qualitySlider.addEventListener('input', (e) => {
    qualityValue.textContent = `${e.target.value}%`;
});

compressBtn.addEventListener('click', () => {
    if (!currentFile) return;
    
    compressImage(currentFile, qualitySlider.value).then(blob => {
        compressedPreview.src = URL.createObjectURL(blob);
        compressedSize.textContent = formatFileSize(blob.size);
    });
});

downloadBtn.addEventListener('click', () => {
    if (!compressedPreview.src) return;
    
    const link = document.createElement('a');
    link.download = `compressed_${currentFile.name}`;
    link.href = compressedPreview.src;
    link.click();
}); 