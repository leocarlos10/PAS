package backend.security_alert.config.services;

import com.fasterxml.jackson.annotation.JsonIgnore;
import backend.security_alert.models.User;
import backend.security_alert.models.enums.UserRol;
import java.io.Serial;
import java.util.Collection;
import java.util.List;
import java.util.Objects;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

public class UserDetailsImpl implements UserDetails {

    @Serial
    private static final long serialVersionUID = 1L;

    @Getter
    private final Long id;

    @Getter
    private final String nombre;

    private final String username;

    @JsonIgnore
    private String password;

    private final Boolean active;

    private final Collection<? extends GrantedAuthority> authorities;

    public UserDetailsImpl(
            Long id,
            String nombre,
            String username,
            String password,
            Boolean active,
            Collection<? extends GrantedAuthority> authorities) {
        
        this.id = id;
        this.nombre = nombre;
        this.username = username;
        this.password = password;
        this.active = active;
        this.authorities = authorities;
    
    }

    public static UserDetailsImpl build(User user) {
        UserRol rol = user.getUser_rol();

        List<GrantedAuthority> authorities = List.of(
                new SimpleGrantedAuthority("ROLE_" + (rol != null ? rol.name() : UserRol.USUARIO.name())));

        return new UserDetailsImpl(
                user.getId(),
                user.getUsername(),
                user.getUsername(),
                user.getPassword(),
                user.getActive(),
                authorities);
    }

    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return authorities;
    }

    @Override
    public String getPassword() {
        return password;
    }

    @Override
    public String getUsername() {
        return username;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return active != null && active;
    }

    @Override
    public boolean equals(Object o) {
       
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        
        UserDetailsImpl user = (UserDetailsImpl) o;
        
        return Objects.equals(id, user.id);
    }
}
