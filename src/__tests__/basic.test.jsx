import { describe, it, expect } from 'vitest';
import React from 'react';
import { render, screen } from '@testing-library/react';
import StaffDashboard from '../pages/staff/Dashboard';
import StaffTasks from '../pages/staff/Tasks';

const mockUser = {
    uid: 'mock-staff-uid',
    email: 'staff@site.com',
    full_name: 'Örnek Personel',
    role: 'staff',
    block: 'B',
    flat_no: '0'
};

describe('Staff Components Rendering', () => {
    it('should render StaffDashboard without errors', async () => {
        const { container } = render(<StaffDashboard user={mockUser} />);
        expect(container).toBeInTheDocument();
        const heading = await screen.findByText('Personel Dashboard');
        expect(heading).toBeInTheDocument();
    });

    it('should render StaffTasks without errors', async () => {
        const { container } = render(<StaffTasks user={mockUser} />);
        expect(container).toBeInTheDocument();
        const heading = await screen.findByText('Atanan Görevlerim');
        expect(heading).toBeInTheDocument();
    });
});

