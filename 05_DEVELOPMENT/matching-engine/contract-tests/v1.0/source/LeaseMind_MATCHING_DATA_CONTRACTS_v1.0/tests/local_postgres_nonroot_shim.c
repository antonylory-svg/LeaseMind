/*
 * Synthetic CI-only shim for restricted root containers that cannot switch UID.
 * It only affects the disposable PostgreSQL child process tree and is never
 * packaged into or permitted for production use.
 */
#include <sys/types.h>
#include <sys/stat.h>
#include <dlfcn.h>
#include <fcntl.h>

uid_t getuid(void) { return 65534; }
uid_t geteuid(void) { return 65534; }
gid_t getgid(void) { return 65534; }
gid_t getegid(void) { return 65534; }

int stat(const char *path, struct stat *buf) {
  static int (*real_stat)(const char *, struct stat *) = 0;
  if (!real_stat) real_stat = dlsym(RTLD_NEXT, "stat");
  int result = real_stat(path, buf);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}

int lstat(const char *path, struct stat *buf) {
  static int (*real_lstat)(const char *, struct stat *) = 0;
  if (!real_lstat) real_lstat = dlsym(RTLD_NEXT, "lstat");
  int result = real_lstat(path, buf);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}

int fstat(int fd, struct stat *buf) {
  static int (*real_fstat)(int, struct stat *) = 0;
  if (!real_fstat) real_fstat = dlsym(RTLD_NEXT, "fstat");
  int result = real_fstat(fd, buf);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}

int fstatat(int dirfd, const char *path, struct stat *buf, int flags) {
  static int (*real_fstatat)(int, const char *, struct stat *, int) = 0;
  if (!real_fstatat) real_fstatat = dlsym(RTLD_NEXT, "fstatat");
  int result = real_fstatat(dirfd, path, buf, flags);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}

int __xstat(int ver, const char *path, struct stat *buf) {
  static int (*real_xstat)(int, const char *, struct stat *) = 0;
  if (!real_xstat) real_xstat = dlsym(RTLD_NEXT, "__xstat");
  int result = real_xstat(ver, path, buf);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}

int __lxstat(int ver, const char *path, struct stat *buf) {
  static int (*real_lxstat)(int, const char *, struct stat *) = 0;
  if (!real_lxstat) real_lxstat = dlsym(RTLD_NEXT, "__lxstat");
  int result = real_lxstat(ver, path, buf);
  if (result == 0) { buf->st_uid = 65534; buf->st_gid = 65534; }
  return result;
}
