import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, User, Home, Briefcase, Eye, EyeOff } from 'lucide-react';
import { loginUser } from '../services/authService';
import Input from '../components/common/Input';
import Button from '../components/common/Button';
import Card from '../components/common/Card';

const Login = ({ onLogin }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: '',
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
        setError('');
    };

    const handleRoleSelect = async (roleEmail) => {
        setFormData({
            email: roleEmail,
            password: '123456',
        });
        setError('');
        setLoading(true);
        try {
            const user = await loginUser(roleEmail, '123456');
            onLogin(user);

            const redirectMap = {
                admin: '/admin/dashboard',
                staff: '/staff/dashboard',
                resident: '/resident/dashboard',
            };

            navigate(redirectMap[user.role] || '/');
        } catch (err) {
            setError('Giriş başarısız. Email veya şifrenizi kontrol edin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const user = await loginUser(formData.email, formData.password);
            onLogin(user);

            // Redirect based on role
            const redirectMap = {
                admin: '/admin/dashboard',
                staff: '/staff/dashboard',
                resident: '/resident/dashboard',
            };

            navigate(redirectMap[user.role] || '/');
        } catch (err) {
            setError('Giriş başarısız. Email veya şifrenizi kontrol edin.');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const roles = [
        { name: 'Admin', email: 'admin@site.com', icon: <User size={16} /> },
        { name: 'Resident', email: 'resident@site.com', icon: <Home size={16} /> },
        { name: 'Staff', email: 'staff@site.com', icon: <Briefcase size={16} /> },
    ];

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 10% 20%, rgba(4, 159, 108, 0.15) 0%, transparent 40%), radial-gradient(circle at 90% 80%, rgba(130, 80, 223, 0.15) 0%, transparent 40%), linear-gradient(135deg, hsl(240, 10%, 4%) 0%, hsl(240, 8%, 8%) 100%)',
            padding: 'var(--spacing-lg)',
        }}>
            <Card style={{ 
                maxWidth: '460px', 
                width: '100%',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(25px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
                padding: 'var(--spacing-xl)',
                borderRadius: '1.25rem'
            }}>
                <div style={{ textAlign: 'center', marginBottom: 'var(--spacing-lg)' }}>
                    <div style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: '64px',
                        height: '64px',
                        borderRadius: 'var(--radius-lg)',
                        background: 'linear-gradient(135deg, rgba(54, 226, 123, 0.1), rgba(0, 112, 243, 0.1))',
                        border: '1px solid rgba(255, 255, 255, 0.1)',
                        marginBottom: 'var(--spacing-md)'
                    }}>
                        <Home size={32} style={{ color: 'var(--color-secondary-light)' }} />
                    </div>
                    <h1 style={{
                        fontSize: 'var(--font-size-3xl)',
                        fontWeight: '700',
                        color: 'var(--color-text-primary)',
                        marginBottom: 'var(--spacing-xs)',
                        letterSpacing: '-0.5px'
                    }}>
                        Site Yönetim Sistemi
                    </h1>
                    <p style={{ color: 'var(--color-text-secondary)', fontSize: 'var(--font-size-sm)' }}>
                        Yönetim Paneline Giriş Yapın
                    </p>
                </div>

                {/* Role Quick Selector */}
                <div style={{
                    display: 'flex',
                    background: 'rgba(255, 255, 255, 0.04)',
                    padding: '4px',
                    borderRadius: 'var(--radius-lg)',
                    marginBottom: 'var(--spacing-lg)',
                    border: '1px solid rgba(255, 255, 255, 0.06)'
                }}>
                    {roles.map((r) => {
                        const isActive = formData.email === r.email;
                        return (
                            <button
                                key={r.name}
                                type="button"
                                onClick={() => handleRoleSelect(r.email)}
                                style={{
                                    flex: 1,
                                    padding: '10px 8px',
                                    borderRadius: 'var(--radius-md)',
                                    border: 'none',
                                    background: isActive ? 'var(--color-secondary-light)' : 'transparent',
                                    color: isActive ? '#fff' : 'var(--color-text-secondary)',
                                    cursor: 'pointer',
                                    fontWeight: '600',
                                    fontSize: 'var(--font-size-sm)',
                                    transition: 'all 0.2s',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '6px'
                                }}
                            >
                                {r.icon}
                                {r.name}
                            </button>
                        );
                    })}
                </div>

                <form onSubmit={handleSubmit}>
                    {error && (
                        <div style={{
                            padding: 'var(--spacing-md)',
                            background: 'hsla(0, 84%, 60%, 0.1)',
                            border: '1px solid var(--color-danger)',
                            borderRadius: 'var(--radius-md)',
                            color: 'var(--color-danger)',
                            marginBottom: 'var(--spacing-lg)',
                            fontSize: 'var(--font-size-sm)',
                        }}>
                            {error}
                        </div>
                    )}

                    <div style={{ marginBottom: 'var(--spacing-md)' }}>
                        <Input
                            label="E-posta Adresiniz"
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            placeholder="ornek@email.com"
                            required
                        />
                    </div>

                    <div style={{ marginBottom: 'var(--spacing-sm)', position: 'relative' }}>
                        <Input
                            label="Şifreniz"
                            type={showPassword ? "text" : "password"}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            placeholder="••••••••"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            style={{
                                position: 'absolute',
                                right: '12px',
                                top: '38px',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--color-text-tertiary)',
                                cursor: 'pointer'
                            }}
                        >
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>

                    <div style={{ textAlign: 'right', marginBottom: 'var(--spacing-lg)' }}>
                        <Link
                            to="/forgot-password"
                            style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--color-text-secondary)',
                                textDecoration: 'none'
                            }}
                        >
                            Şifremi Unuttum?
                        </Link>
                    </div>

                    <Button
                        type="submit"
                        variant="primary"
                        loading={loading}
                        style={{ 
                            width: '100%',
                            padding: '12px',
                            background: 'var(--color-secondary-light)',
                            fontWeight: '600',
                            borderRadius: 'var(--radius-md)'
                        }}
                    >
                        GİRİŞ YAP
                    </Button>

                    <div style={{ textAlign: 'center', marginTop: 'var(--spacing-lg)', fontSize: 'var(--font-size-sm)' }}>
                        <span style={{ color: 'var(--color-text-secondary)' }}>Hesabınız yok mu? </span>
                        <span style={{ color: 'var(--color-secondary-light)', fontWeight: '600', cursor: 'pointer' }}>Hemen Kaydolun</span>
                    </div>
                </form>
            </Card>
        </div>
    );
};

export default Login;
