import { Link } from 'react-router-dom';
import { Package, Layers, ArrowRight, BarChart3, GitBranch } from 'lucide-react';
import MainLayout from '@/layouts/MainLayout';
import { Button } from '@/components/ui/button';

const Index = () => {
  return (
    <MainLayout>
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-64px)] px-6">
        <div className="max-w-2xl text-center animate-fade-in">
          {/* Hero Icon */}
          <div className="w-20 h-20 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary to-blue-500 flex items-center justify-center shadow-lg shadow-primary/25">
            <Layers className="w-10 h-10 text-primary-foreground" />
          </div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-foreground mb-4">
            Welcome to <span className="text-gradient">VendorHub</span>
          </h1>

          {/* Description */}
          <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
            Manage your vendors and their versions with ease. Create, update, and configure 
            version parameters with an intuitive interface designed for productivity.
          </p>

          {/* CTA */}
          <Link to="/vendors">
            <Button size="lg" className="gap-2 px-8">
              Get Started
              <ArrowRight className="w-4 h-4" />
            </Button>
          </Link>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 max-w-4xl w-full animate-slide-in">
          <Link to="/vendors" className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <Package className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Vendor Management</h3>
            <p className="text-sm text-muted-foreground">
              Create and organize vendors with unique codes and metadata.
            </p>
          </Link>

          <Link to="/versions"  className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <GitBranch className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Version Control</h3>
            <p className="text-sm text-muted-foreground">
              Track multiple versions per vendor with full CRUD operations.
            </p>
          </Link>

          <div className="bg-card border border-border rounded-xl p-6 hover:border-primary/50 transition-colors">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
              <BarChart3 className="w-5 h-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground mb-2">Code Configuration</h3>
            <p className="text-sm text-muted-foreground">
              Configure version parameters with an integrated code editor.
            </p>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
