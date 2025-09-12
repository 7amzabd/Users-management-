"use client";

import { useEffect, useState, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    ArrowLeft,
    Plus,
    Edit,
    Trash2,
    FileText,
    Mail,
    AtSign,
    Loader2,
    Search,
    Filter,
    Grid3X3,
    List,
    Users,
    TrendingUp,
    Calendar,
    Eye,
} from "lucide-react";

interface User {
    id?: number;
    name: string;
    username: string;
    email: string;
}

interface Post {
    userId: number;
    id: number;
    title: string;
    body: string;
}

export default function UsersPage() {
    const [users, setUsers] = useState<User[]>([]);
    const [newUser, setNewUser] = useState<Omit<User, "id">>({
        name: "",
        username: "",
        email: "",
    });
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [isAdding, setIsAdding] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [selectedUser, setSelectedUser] = useState<User | null>(null);
    const [posts, setPosts] = useState<Post[]>([]);
    const [postsLoading, setPostsLoading] = useState(false);
    const [editingPost, setEditingPost] = useState<Post | null>(null);
    const [deleteUserId, setDeleteUserId] = useState<number | null>(null);
    const [deletePostId, setDeletePostId] = useState<number | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("name");
    const [viewMode, setViewMode] = useState("grid");
    const [filterBy, setFilterBy] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage] = useState(12);

    const [formErrors, setFormErrors] = useState<Record<string, string>>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const nameInputRef = useRef<HTMLInputElement>(null);
    const editNameInputRef = useRef<HTMLInputElement>(null);
    const postTitleInputRef = useRef<HTMLInputElement>(null);

    const navigate = useNavigate();

    // Focus input on modal open
    useEffect(() => {
        if (isAdding && nameInputRef.current) {
            setTimeout(() => nameInputRef.current?.focus(), 100);
        }
    }, [isAdding]);

    useEffect(() => {
        if (editingUser && editNameInputRef.current) {
            setTimeout(() => editNameInputRef.current?.focus(), 100);
        }
    }, [editingUser]);

    useEffect(() => {
        if (editingPost && postTitleInputRef.current) {
            setTimeout(() => postTitleInputRef.current?.focus(), 100);
        }
    }, [editingPost]);

    // Validation function
    const validateForm = (userData: User, isEdit: boolean = false) => {
        const errors: Record<string, string> = {};

        if (!userData.name?.trim()) {
            errors.name = "Full name is required";
        } else if (userData.name.trim().length < 2) {
            errors.name = "Name must be at least 2 characters";
        }

        if (!userData.username?.trim()) {
            errors.username = "Username is required";
        } else if (userData.username.trim().length < 3) {
            errors.username = "Username must be at least 3 characters";
        } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username.trim())) {
            errors.username = "Username can only contain letters, numbers, and underscores";
        }

        if (!userData.email?.trim()) {
            errors.email = "Email is required";
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email.trim())) {
            errors.email = "Please enter a valid email address";
        }

        const existingUsers = isEdit ? users.filter((u) => u.id !== userData.id) : users;

        if (
            userData.username?.trim() &&
            existingUsers.some((u) => u.username.toLowerCase() === userData.username.trim().toLowerCase())
        ) {
            errors.username = "Username already exists";
        }

        if (
            userData.email?.trim() &&
            existingUsers.some((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase())
        ) {
            errors.email = "Email already exists";
        }

        return errors;
    };

    // Fetch users
    useEffect(() => {
        setLoading(true);
        fetch("https://jsonplaceholder.typicode.com/users")
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch users");
                return res.json();
            })
            .then((data) => setUsers(data))
            .catch((err) => setError(err.message))
            .finally(() => setLoading(false));
    }, []);

    // CREATE user
    const handleAddUser = async () => {
        const errors = validateForm(newUser);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 800));

        const newEntry: User = { id, ...newUser };

        setUsers((prevUsers) => [...prevUsers, newEntry]);
        setNewUser({ name: "", username: "", email: "" });
        setFormErrors({});
        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            setIsAdding(false);
        }, 1500);
    };

    // UPDATE user
    const handleUpdateUser = async () => {
        if (!editingUser) return;

        const errors = validateForm(editingUser, true);
        setFormErrors(errors);

        if (Object.keys(errors).length > 0) {
            return;
        }

        setIsSubmitting(true);

        await new Promise((resolve) => setTimeout(resolve, 800));

        setUsers((s) => s.map((user) => (user.id === editingUser.id ? editingUser : user)));
        setFormErrors({});
        setIsSubmitting(false);
        setShowSuccess(true);

        setTimeout(() => {
            setShowSuccess(false);
            setEditingUser(null);
        }, 1500);
    };

    // DELETE user
    const handleDeleteUser = (id: number) => {
        setUsers((s) => s.filter((user) => user.id !== id));
        setDeleteUserId(null);
    };

    // View posts for a single user
    const handleViewPosts = (user: User) => {
        setSelectedUser(user);
        setPostsLoading(true);
        setPosts([]);
        fetch(`https://jsonplaceholder.typicode.com/users/${user.id}/posts`)
            .then((res) => {
                if (!res.ok) throw new Error("Failed to fetch posts");
                return res.json();
            })
            .then((data) => {
                setPosts(data);
            })
            .catch(() => setPosts([]))
            .finally(() => setPostsLoading(false));
    };

    // Delete a specific post
    const handleDeletePost = (postId: number) => {
        setPosts((s) => s.filter((p) => p.id !== postId));
        setDeletePostId(null);
    };

    // Save edited post
    const handleSaveEditedPost = () => {
        if (!editingPost) return;
        if (!editingPost.title.trim()) {
            return;
        }
        setPosts((s) => s.map((p) => (p.id === editingPost.id ? editingPost : p)));
        setEditingPost(null);
    };

    // Filter and sort users
    const filteredAndSortedUsers = useMemo(() => {
        const filtered = users.filter((user) => {
            const matchesSearch =
                user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
                user.email.toLowerCase().includes(searchQuery.toLowerCase());


            return matchesSearch;
        });

        filtered.sort((a, b) => {
            switch (sortBy) {
                case "name":
                    return a.name.localeCompare(b.name);
                case "username":
                    return a.username.localeCompare(b.username);
                case "email":
                    return a.email.localeCompare(b.email);
                case "id":
                    return a.id - b.id;
                default:
                    return 0;
            }
        });

        return filtered;
    }, [users, searchQuery, sortBy, filterBy]);

    // Paginate users
    const paginatedUsers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedUsers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedUsers, currentPage, itemsPerPage]);

    const totalPages = Math.ceil(filteredAndSortedUsers.length / itemsPerPage);

    // Global keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.ctrlKey && e.key === "k") {
                e.preventDefault();
                document.querySelector('input[placeholder*="Search"]')?.focus();
            }
            if (e.key === "Escape") {
                if (isAdding) setIsAdding(false);
                if (editingUser) setEditingUser(null);
                if (selectedUser) setSelectedUser(null);
                if (editingPost) setEditingPost(null);
                if (deleteUserId) setDeleteUserId(null);
                if (deletePostId) setDeletePostId(null);
            }
        };

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [isAdding, editingUser, selectedUser, editingPost, deleteUserId, deletePostId]);

    return (
        <div className="min-h-screen bg-background">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                {/* Header */}
                <div className="flex flex-col gap-6 mb-8">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <Button variant="outline" size="sm" onClick={() => navigate(-1)} className="flex items-center gap-2">
                                <ArrowLeft className="h-4 w-4" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold text-foreground">User Directory</h1>
                                <p className="text-muted-foreground mt-1">Manage your users and their content</p>
                            </div>
                        </div>
                        <Button
                            onClick={() => {
                                setNewUser({ name: "", username: "", email: "" });
                                setIsAdding(true);
                            }}
                            className="flex items-center gap-2"
                        >
                            <Plus className="h-4 w-4" />
                            Add User
                        </Button>
                    </div>

                    {/* Stats Cards */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                                    <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Users</p>
                                    <p className="text-2xl font-bold">{users.length}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                                    <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Active Users</p>
                                    <p className="text-2xl font-bold">{Math.floor(users.length * 0.7)}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                                    <FileText className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">Total Posts</p>
                                    <p className="text-2xl font-bold">{users.length * 10}</p>
                                </div>
                            </div>
                        </Card>
                        <Card className="p-4">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-orange-100 dark:bg-orange-900/20 rounded-lg">
                                    <Calendar className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">This Month</p>
                                    <p className="text-2xl font-bold">+{Math.floor(users.length * 0.2)}</p>
                                </div>
                            </div>
                        </Card>
                    </div>

                    {/* Search and Filter Controls */}
                    <Card className="p-4">
                        <div className="flex flex-col lg:flex-row gap-4">
                            <div className="flex-1 relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Search users by name, username, or email..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="pl-10"
                                />
                                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">K</kbd>
                                </div>
                            </div>
                            <div className="flex gap-2">
                                <Select value={sortBy} onValueChange={setSortBy}>
                                    <SelectTrigger className="w-[140px]">
                                        <SelectValue placeholder="Sort by" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="name">Name</SelectItem>
                                        <SelectItem value="username">Username</SelectItem>
                                        <SelectItem value="email">Email</SelectItem>
                                        <SelectItem value="id">ID</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Select value={filterBy} onValueChange={setFilterBy}>
                                    <SelectTrigger className="w-[120px]">
                                        <Filter className="h-4 w-4 mr-2" />
                                        <SelectValue placeholder="Filter" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Users</SelectItem>
                                        <SelectItem value="active">Active</SelectItem>
                                        <SelectItem value="recent">Recent</SelectItem>
                                    </SelectContent>
                                </Select>
                                <div className="flex border rounded-md">
                                    <Button
                                        variant={viewMode === "grid" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("grid")}
                                        className="rounded-r-none"
                                    >
                                        <Grid3X3 className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant={viewMode === "list" ? "default" : "ghost"}
                                        size="sm"
                                        onClick={() => setViewMode("list")}
                                        className="rounded-l-none"
                                    >
                                        <List className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </Card>
                </div>

                {/* Loading / Error States */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                        <span className="ml-2 text-muted-foreground">Loading users...</span>
                    </div>
                )}

                {error && (
                    <Card className="border-destructive/50 bg-destructive/5">
                        <CardContent className="pt-6">
                            <p className="text-destructive">Error: {error}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Enhanced User Display with Grid/List View Toggle */}
                {!loading && !error && (
                    <>
                        {filteredAndSortedUsers.length === 0 ? (
                            <Card className="p-12 text-center">
                                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                                <h3 className="text-lg font-semibold mb-2">No users found</h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery
                                        ? "Try adjusting your search criteria"
                                        : "Get started by adding your first user"}
                                </p>
                                <Button onClick={() => setIsAdding(true)}>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </Button>
                            </Card>
                        ) : (
                            <>
                                {viewMode === "grid" ? (
                                    <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                        {paginatedUsers.map((user, index) => (
                                            <Card
                                                key={user.id}
                                                className="group hover:shadow-lg transition-all duration-200 hover:-translate-y-1 animate-in fade-in-0 slide-in-from-bottom-4"
                                                style={{ animationDelay: `${index * 50}ms` }}
                                            >
                                                <CardHeader className="pb-4">
                                                    <div className="flex items-center gap-3">
                                                        <Avatar className="h-12 w-12 ring-2 ring-background shadow-sm">
                                                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                                {user.name.charAt(0).toUpperCase()}
                                                            </AvatarFallback>
                                                        </Avatar>
                                                        <div className="flex-1 min-w-0">
                                                            <h3 className="font-semibold text-card-foreground truncate">
                                                                {user.name}
                                                            </h3>
                                                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                                                <AtSign className="h-3 w-3" />
                                                                <span className="truncate">{user.username}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </CardHeader>

                                                <CardContent className="space-y-4">
                                                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                        <Mail className="h-4 w-4 flex-shrink-0" />
                                                        <span className="truncate">{user.email}</span>
                                                    </div>

                                                    <div className="flex flex-col gap-2">
                                                        <div className="flex gap-2">
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setEditingUser(user)}
                                                                className="flex-1 flex items-center gap-1"
                                                            >
                                                                <Edit className="h-3 w-3" />
                                                                Edit
                                                            </Button>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeleteUserId(user.id)}
                                                                className="flex-1 flex items-center gap-1 text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                                Delete
                                                            </Button>
                                                        </div>

                                                        <Button
                                                            variant="secondary"
                                                            size="sm"
                                                            onClick={() => handleViewPosts(user)}
                                                            className="flex items-center gap-1"
                                                        >
                                                            <FileText className="h-3 w-3" />
                                                            View Posts
                                                        </Button>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        ))}
                                    </div>
                                ) : (
                                    <Card>
                                        <div className="divide-y">
                                            {paginatedUsers.map((user, index) => (
                                                <div
                                                    key={user.id}
                                                    className="p-4 hover:bg-muted/50 transition-colors animate-in fade-in-0 slide-in-from-left-4"
                                                    style={{ animationDelay: `${index * 30}ms` }}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                                            <Avatar className="h-10 w-10">
                                                                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                                                    {user.name.charAt(0).toUpperCase()}
                                                                </AvatarFallback>
                                                            </Avatar>
                                                            <div className="flex-1 min-w-0">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <h3 className="font-semibold truncate">{user.name}</h3>
                                                                    <Badge variant="secondary" className="text-xs">
                                                                        @{user.username}
                                                                    </Badge>
                                                                </div>
                                                                <p className="text-sm text-muted-foreground truncate">{user.email}</p>
                                                            </div>
                                                        </div>
                                                        <div className="flex items-center gap-2">
                                                            <Button variant="ghost" size="sm" onClick={() => handleViewPosts(user)}>
                                                                <Eye className="h-4 w-4" />
                                                            </Button>
                                                            <Button variant="ghost" size="sm" onClick={() => setEditingUser(user)}>
                                                                <Edit className="h-4 w-4" />
                                                            </Button>
                                                            <Button
                                                                variant="ghost"
                                                                size="sm"
                                                                onClick={() => setDeleteUserId(user.id)}
                                                                className="text-destructive hover:text-destructive-foreground hover:bg-destructive"
                                                            >
                                                                <Trash2 className="h-4 w-4" />
                                                            </Button>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </Card>
                                )}

                                {/* Pagination */}
                                {totalPages > 1 && (
                                    <div className="flex items-center justify-between mt-8">
                                        <p className="text-sm text-muted-foreground">
                                            Showing {(currentPage - 1) * itemsPerPage + 1} to{" "}
                                            {Math.min(currentPage * itemsPerPage, filteredAndSortedUsers.length)} of{" "}
                                            {filteredAndSortedUsers.length} users
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                                                disabled={currentPage === 1}
                                            >
                                                Previous
                                            </Button>
                                            <div className="flex items-center gap-1">
                                                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                    const page = i + 1;
                                                    return (
                                                        <Button
                                                            key={page}
                                                            variant={currentPage === page ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(page)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {page}
                                                        </Button>
                                                    );
                                                })}
                                                {totalPages > 5 && (
                                                    <>
                                                        <span className="text-muted-foreground">...</span>
                                                        <Button
                                                            variant={currentPage === totalPages ? "default" : "outline"}
                                                            size="sm"
                                                            onClick={() => setCurrentPage(totalPages)}
                                                            className="w-8 h-8 p-0"
                                                        >
                                                            {totalPages}
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                                                disabled={currentPage === totalPages}
                                            >
                                                Next
                                            </Button>
                                        </div>
                                    </div>
                                )}
                            </>
                        )}
                    </>
                )}
            </div>

            {/* Add User Dialog */}
            <Dialog open={isAdding} onOpenChange={setIsAdding}>
                <DialogContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                    {showSuccess && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                            <div className="text-center space-y-4 animate-in zoom-in-50 fade-in-0">
                                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">User Added Successfully!</h3>
                                    <p className="text-sm text-muted-foreground">The new user has been created</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogHeader className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900/20">
                            <Plus className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-xl font-semibold">Add New User</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">
                                Create a new user account with their basic information
                            </p>
                        </div>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        <div className="grid gap-4">
                            <div className="space-y-2">
                                <Label htmlFor="name" className="text-sm font-medium flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    Full Name
                                    <span className="text-red-500">*</span>
                                </Label>
                                <Input
                                    ref={nameInputRef}
                                    id="name"
                                    placeholder="Enter full name"
                                    value={newUser.name}
                                    onChange={(e) => {
                                        setNewUser({ ...newUser, name: e.target.value });
                                        if (formErrors.name) {
                                            setFormErrors((prev) => ({ ...prev, name: undefined }));
                                        }
                                    }}
                                    className={`h-11 transition-all focus:ring-2 focus:ring-blue-500/20 ${
                                        formErrors.name ? "border-red-500 focus:ring-red-500/20" : ""
                                    }`}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter") {
                                            if (e.ctrlKey) {
                                                handleAddUser();
                                            } else {
                                                document.getElementById("username")?.focus();
                                            }
                                        }
                                    }}
                                    disabled={isSubmitting || showSuccess}
                                    aria-describedby={formErrors.name ? "name-error" : undefined}
                                />
                                {formErrors.name && (
                                    <p
                                        id="name-error"
                                        className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                        role="alert"
                                    >
                                        <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                        {formErrors.name}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="username" className="text-sm font-medium flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                    Username
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="username"
                                        placeholder="Enter username"
                                        value={newUser.username}
                                        onChange={(e) => {
                                            setNewUser({ ...newUser, username: e.target.value });
                                            if (formErrors.username) {
                                                setFormErrors((prev) => ({ ...prev, username: undefined }));
                                            }
                                        }}
                                        className={`h-11 pl-10 transition-all focus:ring-2 focus:ring-green-500/20 ${
                                            formErrors.username ? "border-red-500 focus:ring-red-500/20" : ""
                                        }`}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                if (e.ctrlKey) {
                                                    handleAddUser();
                                                } else {
                                                    document.getElementById("email")?.focus();
                                                }
                                            }
                                        }}
                                        disabled={isSubmitting || showSuccess}
                                        aria-describedby={formErrors.username ? "username-error" : undefined}
                                    />
                                </div>
                                {formErrors.username && (
                                    <p
                                        id="username-error"
                                        className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                        role="alert"
                                    >
                                        <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                        {formErrors.username}
                                    </p>
                                )}
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-sm font-medium flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                    Email Address
                                    <span className="text-red-500">*</span>
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="Enter email address"
                                        value={newUser.email}
                                        onChange={(e) => {
                                            setNewUser({ ...newUser, email: e.target.value });
                                            if (formErrors.email) {
                                                setFormErrors((prev) => ({ ...prev, email: undefined }));
                                            }
                                        }}
                                        className={`h-11 pl-10 transition-all focus:ring-2 focus:ring-purple-500/20 ${
                                            formErrors.email ? "border-red-500 focus:ring-red-500/20" : ""
                                        }`}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter" && e.ctrlKey) {
                                                handleAddUser();
                                            }
                                        }}
                                        disabled={isSubmitting || showSuccess}
                                        aria-describedby={formErrors.email ? "email-error" : undefined}
                                    />
                                </div>
                                {formErrors.email && (
                                    <p
                                        id="email-error"
                                        className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                        role="alert"
                                    >
                                        <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                        {formErrors.email}
                                    </p>
                                )}
                            </div>
                        </div>

                        {(newUser.name || newUser.username || newUser.email) && (
                            <div className="rounded-lg border bg-muted/50 p-4 animate-in fade-in-0 slide-in-from-bottom-2">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Live Preview
                                </h4>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white font-semibold">
                                            {newUser.name ? newUser.name.charAt(0).toUpperCase() : "?"}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{newUser.name || "Full Name"}</p>
                                        <p className="text-xs text-muted-foreground">
                                            @{newUser.username || "username"} • {newUser.email || "email@example.com"}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {!showSuccess && (
                            <div className="text-xs text-muted-foreground text-center space-y-1">
                                <p>
                                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to move to next field
                                </p>
                                <p>
                                    Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
                                    <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save quickly
                                </p>
                            </div>
                        )}
                    </div>

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsAdding(false);
                                setFormErrors({});
                                setNewUser({ name: "", username: "", email: "" });
                                setShowSuccess(false);
                            }}
                            className="flex-1"
                            disabled={isSubmitting || showSuccess}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleAddUser}
                            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            disabled={
                                isSubmitting ||
                                showSuccess ||
                                !newUser.name.trim() ||
                                !newUser.username.trim() ||
                                !newUser.email.trim()
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Adding User...
                                </>
                            ) : (
                                <>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add User
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit User Dialog */}
            <Dialog
                open={!!editingUser}
                onOpenChange={() => {
                    setEditingUser(null);
                    setFormErrors({});
                    setShowSuccess(false);
                }}
            >
                <DialogContent className="sm:max-w-lg" onOpenAutoFocus={(e) => e.preventDefault()}>
                    {showSuccess && (
                        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex items-center justify-center z-50 rounded-lg">
                            <div className="text-center space-y-4 animate-in zoom-in-50 fade-in-0">
                                <div className="mx-auto h-16 w-16 rounded-full bg-green-100 dark:bg-green-900/20 flex items-center justify-center">
                                    <div className="h-8 w-8 rounded-full bg-green-500 flex items-center justify-center animate-pulse">
                                        <svg
                                            className="h-5 w-5 text-white"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke="currentColor"
                                        >
                                            <path
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                                strokeWidth={2}
                                                d="M5 13l4 4L19 7"
                                            />
                                        </svg>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="font-semibold text-green-700 dark:text-green-300">Changes Saved!</h3>
                                    <p className="text-sm text-muted-foreground">User information has been updated</p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogHeader className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/20">
                            <Edit className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-xl font-semibold">Edit User</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">Update user information and save changes</p>
                        </div>
                    </DialogHeader>

                    {editingUser && (
                        <div className="space-y-6 py-4">
                            <div className="grid gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="edit-name" className="text-sm font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        Full Name
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <Input
                                        ref={editNameInputRef}
                                        id="edit-name"
                                        value={editingUser.name}
                                        onChange={(e) => {
                                            setEditingUser({ ...editingUser, name: e.target.value });
                                            if (formErrors.name) {
                                                setFormErrors((prev) => ({ ...prev, name: undefined }));
                                            }
                                        }}
                                        className={`h-11 transition-all focus:ring-2 focus:ring-blue-500/20 ${
                                            formErrors.name ? "border-red-500 focus:ring-red-500/20" : ""
                                        }`}
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                if (e.ctrlKey) {
                                                    handleUpdateUser();
                                                } else {
                                                    document.getElementById("edit-username")?.focus();
                                                }
                                            }
                                        }}
                                        disabled={isSubmitting || showSuccess}
                                        aria-describedby={formErrors.name ? "edit-name-error" : undefined}
                                    />
                                    {formErrors.name && (
                                        <p
                                            id="edit-name-error"
                                            className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                            role="alert"
                                        >
                                            <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                            {formErrors.name}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-username" className="text-sm font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        Username
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <AtSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-username"
                                            value={editingUser.username}
                                            onChange={(e) => {
                                                setEditingUser({ ...editingUser, username: e.target.value });
                                                if (formErrors.username) {
                                                    setFormErrors((prev) => ({ ...prev, username: undefined }));
                                                }
                                            }}
                                            className={`h-11 pl-10 transition-all focus:ring-2 focus:ring-green-500/20 ${
                                                formErrors.usernae ? "border-red-500 focus:ring-red-500/20" : ""
                                            }`}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter") {
                                                    if (e.ctrlKey) {
                                                        handleUpdateUser();
                                                    } else {
                                                        document.getElementById("edit-email")?.focus();
                                                    }
                                                }
                                            }}
                                            disabled={isSubmitting || showSuccess}
                                            aria-describedby={formErrors.username ? "edit-username-error" : undefined}
                                        />
                                    </div>
                                    {formErrors.username && (
                                        <p
                                            id="edit-username-error"
                                            className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                            role="alert"
                                        >
                                            <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                            {formErrors.username}
                                        </p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="edit-email" className="text-sm font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-purple-500"></div>
                                        Email Address
                                        <span className="text-red-500">*</span>
                                    </Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                        <Input
                                            id="edit-email"
                                            type="email"
                                            value={editingUser.email}
                                            onChange={(e) => {
                                                setEditingUser({ ...editingUser, email: e.target.value });
                                                if (formErrors.email) {
                                                    setFormErrors((prev) => ({ ...prev, email: undefined }));
                                                }
                                            }}
                                            className={`h-11 pl-10 transition-all focus:ring-2 focus:ring-purple-500/20 ${
                                                formErrors.email ? "border-red-500 focus:ring-red-500/20" : ""
                                            }`}
                                            onKeyDown={(e) => {
                                                if (e.key === "Enter" && e.ctrlKey) {
                                                    handleUpdateUser();
                                                }
                                            }}
                                            disabled={isSubmitting || showSuccess}
                                            aria-describedby={formErrors.email ? "edit-email-error" : undefined}
                                        />
                                    </div>
                                    {formErrors.email && (
                                        <p
                                            id="edit-email-error"
                                            className="text-xs text-red-500 flex items-center gap-1 animate-in slide-in-from-top-1"
                                            role="alert"
                                        >
                                            <div className="h-1 w-1 rounded-full bg-red-500"></div>
                                            {formErrors.email}
                                        </p>
                                    )}
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/50 p-4 animate-in fade-in-0 slide-in-from-bottom-2">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Updated Preview
                                </h4>
                                <div className="flex items-center gap-3">
                                    <Avatar className="h-10 w-10">
                                        <AvatarFallback className="bg-gradient-to-br from-orange-500 to-red-600 text-white font-semibold">
                                            {editingUser.name.charAt(0).toUpperCase()}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-sm">{editingUser.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            @{editingUser.username} • {editingUser.email}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {!showSuccess && (
                                <div className="text-xs text-muted-foreground text-center space-y-1">
                                    <p>
                                        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to move to next field
                                    </p>
                                    <p>
                                        Press <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Ctrl</kbd> +{" "}
                                        <kbd className="px-1.5 py-0.5 bg-muted rounded text-xs">Enter</kbd> to save quickly
                                    </p>
                                </div>
                            )}
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setEditingUser(null);
                                setFormErrors({});
                                setShowSuccess(false);
                            }}
                            className="flex-1"
                            disabled={isSubmitting || showSuccess}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleUpdateUser}
                            className="flex-1 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700"
                            disabled={
                                isSubmitting ||
                                showSuccess ||
                                !editingUser?.name.trim() ||
                                !editingUser?.username.trim() ||
                                !editingUser?.email.trim()
                            }
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    Saving Changes...
                                </>
                            ) : (
                                <>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Save Changes
                                </>
                            )}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Posts Dialog */}
            <Dialog
                open={!!selectedUser}
                onOpenChange={() => {
                    setSelectedUser(null);
                    setPosts([]);
                    setEditingPost(null);
                }}
            >
                <DialogContent className="sm:max-w-5xl max-h-[90vh] flex flex-col">
                    <DialogHeader className="space-y-3 pb-4 border-b">
                        <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-600">
                                <FileText className="h-6 w-6 text-white" />
                            </div>
                            <div className="flex-1">
                                <DialogTitle className="text-xl font-semibold flex items-center gap-2">
                                    Posts by {selectedUser?.name}
                                    <Badge variant="secondary" className="ml-2">
                                        {posts.length} posts
                                    </Badge>
                                </DialogTitle>
                                <p className="text-sm text-muted-foreground mt-1">Manage and view all posts created by this user</p>
                            </div>
                        </div>
                    </DialogHeader>

                    <div className="flex-1 overflow-hidden">
                        <Tabs defaultValue="posts" className="h-full flex flex-col">
                            <TabsList className="grid w-full grid-cols-2 mb-4">
                                <TabsTrigger value="posts" className="flex items-center gap-2">
                                    <FileText className="h-4 w-4" />
                                    Posts ({posts.length})
                                </TabsTrigger>
                                <TabsTrigger value="analytics" className="flex items-center gap-2">
                                    <TrendingUp className="h-4 w-4" />
                                    Analytics
                                </TabsTrigger>
                            </TabsList>

                            <TabsContent value="posts" className="flex-1 overflow-hidden">
                                <ScrollArea className="h-[400px] pr-4">
                                    {postsLoading ? (
                                        <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                            <div className="relative">
                                                <div className="h-12 w-12 rounded-full border-4 border-muted"></div>
                                                <div className="absolute top-0 left-0 h-12 w-12 rounded-full border-4 border-blue-500 border-t-transparent animate-spin"></div>
                                            </div>
                                            <div className="text-center">
                                                <p className="font-medium">Loading posts...</p>
                                                <p className="text-sm text-muted-foreground">Fetching user content</p>
                                            </div>
                                        </div>
                                    ) : posts.length === 0 ? (
                                        <div className="text-center py-12 space-y-4">
                                            <div className="mx-auto h-16 w-16 rounded-full bg-muted flex items-center justify-center">
                                                <FileText className="h-8 w-8 text-muted-foreground" />
                                            </div>
                                            <div>
                                                <h3 className="font-semibold text-lg">No posts yet</h3>
                                                <p className="text-muted-foreground">This user hasn't created any posts.</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {posts.map((post, index) => (
                                                <Card
                                                    key={post.id}
                                                    className="group hover:shadow-md transition-all duration-200 animate-in fade-in-0 slide-in-from-bottom-2 border-l-4 border-l-blue-500"
                                                    style={{ animationDelay: `${index * 50}ms` }}
                                                >
                                                    <div className="p-6">
                                                        <div className="flex items-start justify-between gap-4">
                                                            <div className="flex-1 min-w-0 space-y-3">
                                                                <div className="flex items-center gap-3">
                                                                    <Badge variant="secondary" className="text-xs font-mono">
                                                                        #{post.id}
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Eye className="h-3 w-3 mr-1" />
                                                                        {Math.floor(Math.random() * 500) + 50} views
                                                                    </Badge>
                                                                    <Badge variant="outline" className="text-xs">
                                                                        <Calendar className="h-3 w-3 mr-1" />
                                                                        {new Date().toLocaleDateString()}
                                                                    </Badge>
                                                                </div>

                                                                <div>
                                                                    <h4 className="font-semibold text-base mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                                                        {post.title}
                                                                    </h4>
                                                                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                                                                        {post.body}
                                                                    </p>
                                                                </div>
                                                            </div>

                                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setEditingPost(post)}
                                                                    className="h-8 w-8 p-0 hover:bg-blue-100 hover:text-blue-600"
                                                                >
                                                                    <Edit className="h-4 w-4" />
                                                                </Button>
                                                                <Button
                                                                    variant="ghost"
                                                                    size="sm"
                                                                    onClick={() => setDeletePostId(post.id)}
                                                                    className="h-8 w-8 p-0 hover:bg-red-100 hover:text-red-600"
                                                                >
                                                                    <Trash2 className="h-4 w-4" />
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </ScrollArea>
                            </TabsContent>

                            <TabsContent value="analytics" className="flex-1">
                                <div className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-blue-500 rounded-lg">
                                                    <FileText className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Total Posts</p>
                                                    <p className="text-2xl font-bold text-blue-900 dark:text-blue-100">{posts.length}</p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 border-green-200 dark:border-green-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-green-500 rounded-lg">
                                                    <Eye className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-green-700 dark:text-green-300">Total Views</p>
                                                    <p className="text-2xl font-bold text-green-900 dark:text-green-100">
                                                        {posts.length * Math.floor(Math.random() * 100 + 150)}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>

                                        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 border-purple-200 dark:border-purple-800">
                                            <div className="flex items-center gap-3">
                                                <div className="p-3 bg-purple-500 rounded-lg">
                                                    <TrendingUp className="h-5 w-5 text-white" />
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-purple-700 dark:text-purple-300">Avg. Views</p>
                                                    <p className="text-2xl font-bold text-purple-900 dark:text-purple-100">
                                                        {posts.length > 0 ? Math.floor(Math.random() * 50 + 75) : 0}
                                                    </p>
                                                </div>
                                            </div>
                                        </Card>
                                    </div>

                                    <Card className="p-8">
                                        <div className="text-center space-y-4">
                                            <div className="mx-auto h-16 w-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                                                <TrendingUp className="h-8 w-8 text-white" />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                                                <p className="text-muted-foreground">Detailed insights and performance metrics coming soon</p>
                                            </div>
                                        </div>
                                    </Card>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    <DialogFooter className="gap-3 pt-4 border-t">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setSelectedUser(null);
                                setPosts([]);
                                setEditingPost(null);
                            }}
                            className="flex-1"
                        >
                            Close
                        </Button>
                        {selectedUser && (
                            <Button
                                onClick={() => navigate(`/users/${selectedUser.id}/posts`)}
                                className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                            >
                                <FileText className="h-4 w-4 mr-2" />
                                Go to Posts Page
                            </Button>
                        )}
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Edit Post Dialog */}
            <Dialog open={!!editingPost} onOpenChange={() => setEditingPost(null)}>
                <DialogContent className="sm:max-w-2xl">
                    <DialogHeader className="space-y-3">
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/20">
                            <Edit className="h-6 w-6 text-green-600 dark:text-green-400" />
                        </div>
                        <div className="text-center">
                            <DialogTitle className="text-xl font-semibold">Edit Post</DialogTitle>
                            <p className="text-sm text-muted-foreground mt-1">Update post content and save your changes</p>
                        </div>
                    </DialogHeader>

                    {editingPost && (
                        <div className="space-y-6 py-4">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="post-title" className="text-sm font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                        Post Title
                                    </Label>
                                    <Input
                                        ref={postTitleInputRef}
                                        id="post-title"
                                        value={editingPost.title}
                                        onChange={(e) => setEditingPost({ ...editingPost, title: e.target.value })}
                                        className="h-11 transition-all focus:ring-2 focus:ring-blue-500/20"
                                        placeholder="Enter post title"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="post-body" className="text-sm font-medium flex items-center gap-2">
                                        <div className="h-2 w-2 rounded-full bg-green-500"></div>
                                        Post Content
                                    </Label>
                                    <Textarea
                                        id="post-body"
                                        value={editingPost.body}
                                        onChange={(e) => setEditingPost({ ...editingPost, body: e.target.value })}
                                        rows={6}
                                        className="resize-none transition-all focus:ring-2 focus:ring-green-500/20"
                                        placeholder="Write your post content here..."
                                    />
                                </div>
                            </div>

                            <div className="rounded-lg border bg-muted/50 p-4">
                                <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
                                    <Eye className="h-4 w-4" />
                                    Post Preview
                                </h4>
                                <div className="space-y-2">
                                    <h5 className="font-semibold text-sm">{editingPost.title || "Post Title"}</h5>
                                    <p className="text-xs text-muted-foreground line-clamp-3">
                                        {editingPost.body || "Post content will appear here..."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    <DialogFooter className="gap-3">
                        <Button variant="outline" onClick={() => setEditingPost(null)} className="flex-1">
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSaveEditedPost}
                            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700"
                            disabled={!editingPost?.title.trim()}
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Save Changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Delete User Confirmation */}
            <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
                            <Trash2 className="h-6 w-6 text-red-600 dark:text-red-400" />
                        </div>
                        <AlertDialogTitle>Delete User</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this user? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => {
                                const userToDelete = users.find((user) => user.id === deleteUserId);
                                if (userToDelete) {
                                    handleDeleteUser(userToDelete.id);
                                }
                            }}
                            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            {/* Delete Post Confirmation */}
            <AlertDialog open={!!deletePostId} onOpenChange={() => setDeletePostId(null)}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Post</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this post? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={() => deletePostId && handleDeletePost(deletePostId)}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
}