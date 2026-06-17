import React, { useState, useEffect } from 'react';
import { Users as UsersIcon, ShieldAlert, BadgeCheck, Wrench } from 'lucide-react';
import { getAllUsers } from '../../services/userService';
import Card from '../../components/common/Card';
import Loader from '../../components/common/Loader';

const AdminUsers = () => {
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (error) {
            console.error('Error loading users:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRoleBadge = (role) => {
        switch (role) {
            case 'admin':
                return (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-danger)',
                        background: 'rgba(239, 68, 68, 0.1)',
                        border: '1px solid rgba(239, 68, 68, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase'
                    }}>
                        <ShieldAlert size={12} /> Yönetici
                    </span>
                );
            case 'staff':
                return (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-primary-light)',
                        background: 'rgba(130, 80, 223, 0.1)',
                        border: '1px solid rgba(130, 80, 223, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase'
                    }}>
                        <Wrench size={12} /> Personel
                    </span>
                );
            case 'resident':
            default:
                return (
                    <span style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '0.25rem 0.5rem',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 600,
                        color: 'var(--color-success)',
                        background: 'rgba(34, 197, 94, 0.1)',
                        border: '1px solid rgba(34, 197, 94, 0.2)',
                        borderRadius: 'var(--radius-sm)',
                        textTransform: 'uppercase'
                    }}>
                        <BadgeCheck size={12} /> Site Sakini
                    </span>
                );
        }
    };

    if (loading) {
        return <Loader />;
    }

    return (
        <div className="animate-fade-in-up">
            <h1 style={{ marginBottom: 'var(--spacing-xl)' }}>Kullanıcı Listesi</h1>

            <Card>
                {users.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: 'var(--spacing-xl)', color: 'var(--color-text-tertiary)' }}>
                        <UsersIcon size={48} style={{ margin: '0 auto var(--spacing-md)' }} />
                        <p>Sistemde kayıtlı kullanıcı bulunamadı.</p>
                    </div>
                ) : (
                    <div style={{ overflowX: 'auto' }}>
                        <table>
                            <thead>
                                <tr>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Ad Soyad</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>E-posta</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Rolü</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Blok/Daire</th>
                                    <th style={{ padding: 'var(--spacing-md)' }}>Kayıt Durumu</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => {
                                    const delayClass = `delay-${(index % 4) + 1}`;
                                    return (
                                        <tr key={user.uid || user.email} className={`animate-fade-in-up ${delayClass}`}>
                                            <td style={{ padding: 'var(--spacing-md)', fontWeight: 600 }}>
                                                {user.full_name || 'İsimsiz Kullanıcı'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {user.email}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {getRoleBadge(user.role)}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                {user.role === 'resident' 
                                                    ? `${user.block} Blok - Daire ${user.flat_no}` 
                                                    : '-'}
                                            </td>
                                            <td style={{ padding: 'var(--spacing-md)' }}>
                                                <span style={{ color: 'var(--color-success)', fontWeight: 500 }}>
                                                    ✓ Aktif
                                                </span>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default AdminUsers;
