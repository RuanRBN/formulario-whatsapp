class FormularioWhatsApp {
    constructor() {
        this.formulario = document.getElementById('formulario');
        this.btnEnviar = document.getElementById('btnEnviar');
        this.textoBtn = document.getElementById('textoBtn');
        this.loading = document.getElementById('loading');
        this.statusDiv = document.getElementById('status');
        
        // Configurações
        this.config = {
            whatsappAPI: 'https://api.whatsapp.com/send',
            numeroWhatsApp: '5512982286099', // ALTERE AQUI
            maxFileSize: 5 * 1024 * 1024, // 5MB
            webhookURL: 'https://webhook.site/seu-webhook' // ALTERE AQUI
        };

        this.init();
    }

    init() {
        this.bindEvents();
        this.setupValidation();
        this.mostrarStatus('Formulário carregado e pronto! ✅', 'success');
        setTimeout(() => this.ocultarStatus(), 3000);
    }

    bindEvents() {
        this.formulario.addEventListener('submit', (e) => this.handleSubmit(e));
        
        // Validação em tempo real
        const inputs = this.formulario.querySelectorAll('input, textarea, select');
        inputs.forEach(input => {
            input.addEventListener('blur', () => this.validateField(input));
            input.addEventListener('input', () => this.clearFieldError(input));
        });

        // Validação de arquivo
        document.getElementById('arquivo').addEventListener('change', (e) => {
            this.validateFile(e.target);
        });

        // Formatação de telefone
        document.getElementById('telefone').addEventListener('input', (e) => {
            this.formatPhone(e.target);
        });
    }

    setupValidation() {
        // Adicionar atributos de validação
        document.getElementById('nome').setAttribute('minlength', '2');
        document.getElementById('mensagem').setAttribute('minlength', '10');
    }

    async handleSubmit(e) {
        e.preventDefault();

        if (!this.validateForm()) {
            return;
        }

        await this.enviarFormulario();
    }

    validateForm() {
        const campos = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            mensagem: document.getElementById('mensagem').value.trim(),
            aceito: document.getElementById('aceito').checked
        };

        // Validações
        if (campos.nome.length < 2) {
            this.mostrarStatus('Nome deve ter pelo menos 2 caracteres', 'error');
            return false;
        }

        if (!this.isValidEmail(campos.email)) {
            this.mostrarStatus('Email inválido', 'error');
            return false;
        }

        if (campos.mensagem.length < 10) {
            this.mostrarStatus('Mensagem deve ter pelo menos 10 caracteres', 'error');
            return false;
        }

        if (!campos.aceito) {
            this.mostrarStatus('Você deve aceitar receber contato via WhatsApp', 'error');
            return false;
        }

        return true;
    }

    validateField(field) {
        const value = field.value.trim();
        
        switch(field.id) {
            case 'nome':
                if (value.length < 2) {
                    this.addFieldError(field, 'Nome muito curto');
                }
                break;
            case 'email':
                if (!this.isValidEmail(value)) {
                    this.addFieldError(field, 'Email inválido');
                }
                break;
            case 'mensagem':
                if (value.length < 10) {
                    this.addFieldError(field, 'Mensagem muito curta');
                }
                break;
        }
    }

    addFieldError(field, message) {
        this.clearFieldError(field);
        field.style.borderColor = '#dc3545';
        
        const errorDiv = document.createElement('div');
        errorDiv.className = 'field-error';
        errorDiv.style.color = '#dc3545';
        errorDiv.style.fontSize = '12px';
        errorDiv.style.marginTop = '5px';
        errorDiv.textContent = message;
        
        field.parentNode.appendChild(errorDiv);
    }

    clearFieldError(field) {
        field.style.borderColor = '#e0e0e0';
        const errorDiv = field.parentNode.querySelector('.field-error');
        if (errorDiv) {
            errorDiv.remove();
        }
    }

    validateFile(fileInput) {
        const file = fileInput.files[0];
        if (!file) return;

        if (file.size > this.config.maxFileSize) {
            this.mostrarStatus(`Arquivo muito grande. Máximo: 5MB`, 'error');
            fileInput.value = '';
            return;
        }

        const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf', 
                             'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                             'text/plain'];
        
        if (!allowedTypes.includes(file.type)) {
            this.mostrarStatus('Tipo de arquivo não permitido', 'error');
            fileInput.value = '';
            return;
        }
    }

    formatPhone(input) {
        let value = input.value.replace(/\D/g, '');
        
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        
        input.value = value;
    }

    async enviarFormulario() {
        this.setLoading(true);

        try {
            const formData = this.coletarDados();
            
            // Enviar via WhatsApp Web
            const whatsappURL = this.gerarURLWhatsApp(formData);
            
            // Opcional: Enviar para webhook para backup
            await this.enviarWebhook(formData);
            
            // Abrir WhatsApp
            window.open(whatsappURL, '_blank');
            
            this.mostrarStatus('Redirecionando para WhatsApp... 🚀', 'success');
            
            // Limpar formulário após 3 segundos
            setTimeout(() => {
                this.formulario.reset();
                this.mostrarStatus('Formulário enviado com sucesso! Você pode enviar outro.', 'success');
            }, 3000);

        } catch (error) {
            console.error('Erro ao enviar formulário:', error);
            this.mostrarStatus('Erro ao processar formulário. Tente novamente.', 'error');
        } finally {
            this.setLoading(false);
        }
    }

    coletarDados() {
        const formData = new FormData(this.formulario);
        const data = {};
        
        for (let [key, value] of formData.entries()) {
            data[key] = value;
        }
        
        data.timestamp = new Date().toLocaleString('pt-BR');
        data.userAgent = navigator.userAgent;
        data.url = window.location.href;
        
        return data;
    }

    gerarURLWhatsApp(data) {
        let mensagem = `🔥 *NOVO CONTATO PELO SITE* 🔥\n\n`;
        mensagem += `👤 *Nome:* ${data.nome}\n`;
        mensagem += `📧 *Email:* ${data.email}\n`;
        
        if (data.telefone) {
            mensagem += `📱 *Telefone:* ${data.telefone}\n`;
        }
        
        if (data.assunto) {
            mensagem += `📋 *Assunto:* ${data.assunto}\n`;
        }
        
        mensagem += `💬 *Mensagem:*\n${data.mensagem}\n\n`;
        mensagem += `⏰ *Enviado em:* ${data.timestamp}\n`;
        mensagem += `🌐 *Via:* ${data.url}`;

        const encodedMessage = encodeURIComponent(mensagem);
        return `${this.config.whatsappAPI}?phone=${this.config.numeroWhatsApp}&text=${encodedMessage}`;
    }

    async enviarWebhook(data) {
        try {
            if (!this.config.webhookURL.includes('seu-webhook')) {
                await fetch(this.config.webhookURL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(data)
                });
            }
        } catch (error) {
            console.warn('Erro ao enviar webhook:', error);
        }
    }

    setLoading(loading) {
        this.btnEnviar.disabled = loading;
        
        if (loading) {
            this.textoBtn.classList.add('hidden');
            this.loading.classList.remove('hidden');
        } else {
            this.textoBtn.classList.remove('hidden');
            this.loading.classList.add('hidden');
        }
    }

    mostrarStatus(mensagem, tipo) {
        this.statusDiv.textContent = mensagem;
        this.statusDiv.className = `status ${tipo}`;
        this.statusDiv.classList.remove('hidden');
        
        // Auto-hide após 5 segundos para mensagens de sucesso
        if (tipo === 'success') {
            setTimeout(() => this.ocultarStatus(), 5000);
        }
    }

    ocultarStatus() {
        this.statusDiv.classList.add('hidden');
    }

    isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
}

// Inicializar quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', () => {
    new FormularioWhatsApp();
});

// Service Worker para cache (opcional)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
            .then(registration => console.log('SW registrado'))
            .catch(error => console.log('SW erro:', error));
    });
}
