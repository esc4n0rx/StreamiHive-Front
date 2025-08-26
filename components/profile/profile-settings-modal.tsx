"use client"

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/auth-context';
import { 
  updateProfileSchema, 
  changePasswordSchema,
  type UpdateProfileFormData,
  type ChangePasswordFormData 
} from '@/utils/validation';
import { 
  User, 
  Lock, 
  Trash2, 
  Save, 
  Eye, 
  EyeOff, 
  Loader2,
  Calendar,
  Mail,
  AtSign,
  FileText,
  Image,
  AlertTriangle
} from 'lucide-react';

interface ProfileSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProfileSettingsModal({ open, onOpenChange }: ProfileSettingsModalProps) {
  const { user, updateProfile, changePassword, deleteAccount, isLoading } = useAuth();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("profile");

  // Profile form
  const profileForm = useForm<UpdateProfileFormData>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      name: user?.name || '',
      email: user?.email || '',
      birthDate: user?.birthDate ? user.birthDate.split('T')[0] : '',
      avatarUrl: user?.avatarUrl || '',
      bio: user?.bio || '',
    }
  });

  // Password form
  const passwordForm = useForm<ChangePasswordFormData>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: '',
      newPassword: '',
      confirmNewPassword: '',
    }
  });

  // Update form when user data changes
  useEffect(() => {
    if (user) {
      profileForm.reset({
        name: user.name,
        email: user.email,
        birthDate: user.birthDate ? user.birthDate.split('T')[0] : '',
        avatarUrl: user.avatarUrl || '',
        bio: user.bio || '',
      });
    }
  }, [user, profileForm]);

  // Handle profile update
  const handleProfileUpdate = async (data: UpdateProfileFormData) => {
    setProfileLoading(true);
    try {
      // Remove empty strings and undefined values
      const cleanData = Object.entries(data).reduce((acc, [key, value]) => {
        if (value !== '' && value !== undefined) {
          acc[key as keyof UpdateProfileFormData] = value;
        }
        return acc;
      }, {} as Partial<UpdateProfileFormData>);

      await updateProfile(cleanData);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setProfileLoading(false);
    }
  };

  // Handle password change
  const handlePasswordChange = async (data: ChangePasswordFormData) => {
    setPasswordLoading(true);
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
      passwordForm.reset();
    } catch (error) {
      // Error is handled in the context
    } finally {
      setPasswordLoading(false);
    }
  };

  // Handle account deletion
  const handleDeleteAccount = async () => {
    if (!confirm('Tem certeza que deseja deletar sua conta? Esta ação não pode ser desfeita.')) {
      return;
    }

    const confirmText = prompt('Digite "DELETAR" para confirmar a exclusão da sua conta:');
    if (confirmText !== 'DELETAR') {
      return;
    }

    setDeleteLoading(true);
    try {
      await deleteAccount();
      onOpenChange(false);
    } catch (error) {
      // Error is handled in the context
    } finally {
      setDeleteLoading(false);
    }
  };

  if (!user) return null;

  const bioLength = profileForm.watch('bio')?.length || 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Configurações do Perfil
          </DialogTitle>
          <DialogDescription>
            Gerencie suas informações pessoais e configurações da conta
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="profile">Perfil</TabsTrigger>
            <TabsTrigger value="security">Segurança</TabsTrigger>
            <TabsTrigger value="account">Conta</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              {/* Avatar Preview */}
              <div className="flex flex-col items-center space-y-4">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={profileForm.watch('avatarUrl') || user.avatarUrl} alt={user.name} />
                  <AvatarFallback className="text-lg">
                    {user.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <p className="text-sm text-muted-foreground">
                  Prévia do avatar
                </p>
              </div>

              <form onSubmit={profileForm.handleSubmit(handleProfileUpdate)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name" className="flex items-center gap-2">
                      <User className="h-4 w-4" />
                      Nome
                    </Label>
                    <Input
                      id="name"
                      {...profileForm.register('name')}
                      placeholder="Seu nome completo"
                    />
                    {profileForm.formState.errors.name && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.name.message}
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email" className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...profileForm.register('email')}
                      placeholder="seu@email.com"
                    />
                    {profileForm.formState.errors.email && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.email.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="username" className="flex items-center gap-2">
                      <AtSign className="h-4 w-4" />
                      Nome de usuário
                    </Label>
                    <Input
                      id="username"
                      value={user.username}
                      disabled
                      className="bg-muted"
                    />
                    <p className="text-xs text-muted-foreground">
                      O nome de usuário não pode ser alterado
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="birthDate" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Data de Nascimento
                    </Label>
                    <Input
                      id="birthDate"
                      type="date"
                      {...profileForm.register('birthDate')}
                    />
                    {profileForm.formState.errors.birthDate && (
                      <p className="text-sm text-destructive">
                        {profileForm.formState.errors.birthDate.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="avatarUrl" className="flex items-center gap-2">
                    <Image className="h-4 w-4" />
                    Avatar URL
                  </Label>
                  <Input
                    id="avatarUrl"
                    type="url"
                    {...profileForm.register('avatarUrl')}
                    placeholder="https://exemplo.com/avatar.jpg"
                  />
                  {profileForm.formState.errors.avatarUrl && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.avatarUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio" className="flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Bio
                  </Label>
                  <Textarea
                    id="bio"
                    {...profileForm.register('bio')}
                    placeholder="Conte um pouco sobre você..."
                    rows={3}
                  />
                  <div className="flex justify-between items-center">
                    <p className="text-xs text-muted-foreground">
                      {bioLength}/500 caracteres
                    </p>
                    {bioLength > 450 && (
                      <p className="text-xs text-amber-500">
                        Limite quase atingido
                      </p>
                    )}
                  </div>
                  {profileForm.formState.errors.bio && (
                    <p className="text-sm text-destructive">
                      {profileForm.formState.errors.bio.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full streamhive-button-accent"
                  disabled={profileLoading}
                >
                  {profileLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Salvando...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" />
                      Salvar Alterações
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="p-4 bg-muted/30 rounded-lg mb-6">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <Lock className="h-4 w-4" />
                  Alterar Senha
                </h3>
                <p className="text-sm text-muted-foreground">
                  Use uma senha forte com pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos.
                </p>
              </div>

              <form onSubmit={passwordForm.handleSubmit(handlePasswordChange)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="currentPassword">Senha Atual</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showCurrentPassword ? "text" : "password"}
                      {...passwordForm.register('currentPassword')}
                      placeholder="Sua senha atual"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.currentPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.currentPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? "text" : "password"}
                      {...passwordForm.register('newPassword')}
                      placeholder="Sua nova senha"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.newPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.newPassword.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmNewPassword">Confirmar Nova Senha</Label>
                  <div className="relative">
                    <Input
                      id="confirmNewPassword"
                      type={showConfirmPassword ? "text" : "password"}
                      {...passwordForm.register('confirmNewPassword')}
                      placeholder="Confirme sua nova senha"
                      className="pr-10"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {passwordForm.formState.errors.confirmNewPassword && (
                    <p className="text-sm text-destructive">
                      {passwordForm.formState.errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full streamhive-button-accent"
                  disabled={passwordLoading}
                >
                  {passwordLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Alterando senha...
                    </>
                  ) : (
                    <>
                      <Lock className="mr-2 h-4 w-4" />
                      Alterar Senha
                    </>
                  )}
                </Button>
              </form>
            </motion.div>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account" className="space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div className="space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h3 className="font-semibold mb-4 flex items-center gap-2">
                    <User className="h-4 w-4" />
                    Informações da Conta
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">ID da Conta:</span>
                      <p className="font-mono text-xs bg-muted/50 p-2 rounded mt-1">
                        {user.id}
                      </p>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Conta criada em:</span>
                      <p className="font-medium">
                        {new Date(user.createdAt).toLocaleDateString('pt-BR', {
                          day: '2-digit',
                          month: 'long',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                    {user.updatedAt && (
                      <div className="md:col-span-2">
                        <span className="text-muted-foreground">Última atualização:</span>
                        <p className="font-medium">
                          {new Date(user.updatedAt).toLocaleDateString('pt-BR', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="font-semibold text-destructive flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4" />
                    Zona de Perigo
                  </h3>
                  <div className="p-4 border border-destructive/20 rounded-lg bg-destructive/5">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">Deletar Conta</h4>
                        <p className="text-sm text-muted-foreground mb-4">
                          Esta ação é <strong>irreversível</strong>. Todos os seus dados, incluindo:
                        </p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1 mb-4">
                          <li>Perfil e informações pessoais</li>
                          <li>Histórico de salas criadas</li>
                          <li>Mensagens e participações</li>
                          <li>Configurações e preferências</li>
                        </ul>
                        <p className="text-sm text-muted-foreground mb-4">
                          Serão <strong>permanentemente removidos</strong> e não poderão ser recuperados.
                        </p>
                      </div>
                      
                      <div className="flex flex-col sm:flex-row gap-3">
                        <Button
                          variant="outline"
                          onClick={() => setActiveTab("profile")}
                          className="flex-1"
                        >
                          Cancelar
                        </Button>
                        <Button
                          variant="destructive"
                          onClick={handleDeleteAccount}
                          disabled={deleteLoading}
                          className="flex-1"
                        >
                          {deleteLoading ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Deletando...
                            </>
                          ) : (
                            <>
                              <Trash2 className="mr-2 h-4 w-4" />
                              Deletar Conta
                            </>
                          )}
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}