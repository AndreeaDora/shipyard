package shipyard

import (
	registry "github.com/shipyard/shipyard/registry/v1"
	"crypto/tls"
)

type Registry struct {
	ID             string                   `json:"id,omitempty" gorethink:"id,omitempty"`
	Name           string                   `json:"name,omitempty" gorethink:"name,omitempty"`
	Addr           string                   `json:"addr,omitempty", gorethink:"addr,omitempty"`
	Username       string                   `json:"username,omitempty", gorethink:"username,omitempty"`
	Password       string                   `json:"password,omitempty", gorethink:"password,omitempty"`
	registryClient *registry.RegistryClient `json:"-" gorethink:"-"`
}

func NewRegistry(id, name, addr, username, password string) (*Registry, error) {
	rClient, err := registry.NewRegistryClient(addr, &tls.Config{InsecureSkipVerify: true}, username, password)
	if err != nil {
		return nil, err
	}

	return &Registry{
		ID:             id,
		Name:           name,
		Addr:           addr,
		Username:       username,
		Password:       password,
		registryClient: rClient,
	}, nil
}

func (r *Registry) Repositories() ([]*registry.Repository, error) {
	res, err := r.registryClient.Search("", 1, 100)
	if err != nil {
		return nil, err
	}

	return res.Results, nil
}

func (r *Registry) Repository(name string) (*registry.Repository, error) {
	return r.registryClient.Repository(name)
}

func (r *Registry) DeleteRepository(name string) error {
	return r.registryClient.DeleteRepository(name)
}
