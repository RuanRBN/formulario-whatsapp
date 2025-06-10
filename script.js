document.addEventListener('DOMContentLoaded', function() {
    const formulario = document.getElementById('formulario');
    const btnEnviar = document.getElementById('btnEnviar');
    const textoBtn = document.getElementById('textoBtn');
    const loading = document.getElementById('loading');
    const statusDiv = document.getElementById('status');

    // ⚠️ ALTERE AQUI SEU NÚMERO DO WHATSAPP
    const NUMERO_WHATSAPP = '5512981732266';

    function mostrarStatus(mensagem, tipo) {
        statusDiv.textContent = mensagem;
        statusDiv.className = `status ${tipo}`;
        statusDiv.classList.remove('hidden');
        
        if (tipo === 'success') {
            setTimeout(() => statusDiv.classList.add('hidden'), 5000);
        }
    }

    function setLoading(loading) {
        btnEnviar.disabled = loading;
        if (loading) {
            textoBtn.classList.add('hidden');
            document.getElementById('loading').classList.remove('hidden');
        } else {
            textoBtn.classList.remove('hidden');
            document.getElementById('loading').classList.add('hidden');
        }
    }

    function formatarTelefone(input) {
        let value = input.value.replace(/\D/g, '');
        if (value.length <= 10) {
            value = value.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3');
        } else {
            value = value.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3');
        }
        input.value = value;
    }

    function validarEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }

    function gerarMensagemWhatsApp(dados) {
        let mensagem = `🔥 *NOVO CONTATO PELO SITE* 🔥\n\n`;
        mensagem += `👤 *Nome:* ${dados.nome}\n`;
        mensagem += `📧 *Email:* ${dados.email}\n`;
        
        if (dados.telefone) {
            mensagem += `📱 *Telefone:* ${dados.telefone}\n`;
        }
        
        if (dados.assunto) {
            mensagem += `📋 *Assunto:* ${dados.assunto}\n`;
        }
        
        mensagem += `💬 *Mensagem:*\n${dados.mensagem}\n\n`;
        mensagem += `⏰ *Enviado em:* ${new Date().toLocaleString('pt-BR')}\n`;
        mensagem += `🌐 *Via:* ${window.location.href}`;

        return encodeURIComponent(mensagem);
    }

    // Event Listeners
    document.getElementById('telefone').addEventListener('input', function() {
        formatarTelefone(this);
    });

    formulario.addEventListener('submit', function(e) {
        e.preventDefault();

        const dados = {
            nome: document.getElementById('nome').value.trim(),
            email: document.getElementById('email').value.trim(),
            telefone: document.getElementById('telefone').value.trim(),
            assunto: document.getElementById('assunto').value,
            mensagem: document.getElementById('mensagem').value.trim(),
            aceito: document.getElementById('aceito').checked
        };

        // Validações
        if (dados.nome.length < 2) {
            mostrarStatus('Nome deve ter pelo menos 2 caracteres', 'error');
            return;
        }

        if (!validarEmail(dados.email)) {
            mostrarStatus('Email inválido', 'error');
            return;
        }

        if (dados.mensagem.length < 10) {
            mostrarStatus('Mensagem deve ter pelo menos 10 caracteres', 'error');
            return;
        }

        if (!dados.aceito) {
            mostrarStatus('Você deve aceitar receber contato via WhatsApp', 'error');
            return;
        }

        // Enviar para WhatsApp
        setLoading(true);

        setTimeout(() => {
            const mensagemEncoded = gerarMensagemWhatsApp(dados);
            const whatsappURL = `https://api.whatsapp.com/send?phone=${NUMERO_WHATSAPP}&text=${mensagemEncoded}`;
            
            window.open(whatsappURL, '_blank');
            
            mostrarStatus('Redirecionando para WhatsApp... 🚀', 'success');
            
            setTimeout(() => {
                formulario.reset();
                mostrarStatus('Formulário enviado! Você pode enviar outro.', 'success');
                setLoading(false);
            }, 2000);
        }, 1000);
    });

    // Inicialização
    mostrarStatus('Formulário pronto para uso! ✅', 'success');
});
