import { useState } from "react";
import { useLocation } from "wouter";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Cog, Eye, EyeOff, LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { useToast } from "@/hooks/use-toast";
import { sapLoginSchema, type SapLoginRequest } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";

export default function LoginPage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const form = useForm<SapLoginRequest>({
    resolver: zodResolver(sapLoginSchema),
    defaultValues: {
      username: "manager",
      password: "Ea@12345",
      environment: "HANA"
    }
  });

  const onSubmit = async (data: SapLoginRequest) => {
    setIsLoading(true);
    setError("");

    try {
      const response = await apiRequest("POST", "/api/login", data);
      const result = await response.json();

      if (result.success) {
        toast({
          title: "Login Successful",
          description: "Connected to SAP B1 Service Layer"
        });
        setLocation("/dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Authentication failed";
      setError(errorMessage);
      toast({
        title: "Login Failed",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/20 p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-border">
          <CardContent className="p-8">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-primary rounded-lg flex items-center justify-center mx-auto mb-4">
                <Cog className="h-8 w-8 text-primary-foreground" />
              </div>
              <h1 className="text-2xl font-bold text-foreground">SAP Business One</h1>
              <p className="text-muted-foreground mt-2">Service Layer Integration</p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {error && (
                  <Alert variant="destructive" data-testid="login-error">
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                <FormField
                  control={form.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Username</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          placeholder="Enter your username"
                          data-testid="input-username"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="Enter your password"
                            className="pr-10"
                            data-testid="input-password"
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                            onClick={() => setShowPassword(!showPassword)}
                            data-testid="button-toggle-password"
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <Eye className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="environment"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Database Environment</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-environment">
                            <SelectValue placeholder="Select Environment" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="HANA">SAP HANA</SelectItem>
                          <SelectItem value="MSSQL">Microsoft SQL Server</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="bg-muted/50 rounded-md p-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Service Layer Status:</span>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-foreground">Connected</span>
                    </div>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    URL: <code>https://sap.itlobby.com:50000/b1s/v1</code>
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-primary/90 hover:from-primary/90 hover:to-primary/80 text-primary-foreground"
                  disabled={isLoading}
                  data-testid="button-login"
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Authenticating...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In to SAP B1
                    </>
                  )}
                </Button>
              </form>
            </Form>

            <div className="mt-8 pt-6 border-t border-border">
              <div className="text-center">
                <p className="text-xs text-muted-foreground">
                  Database: <span className="font-medium">ZZZ_IT_TEST_LIVE_DB</span>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Session timeout: 30 minutes
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
